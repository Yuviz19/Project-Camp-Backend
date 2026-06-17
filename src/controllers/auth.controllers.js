import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/aync-handler.js";
import { emailVerificationMailContent, forgotPasswordMailContent, sendMail } from "../utils/mail_gen.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const generateAccessRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    // don't touch any other feild
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    console.error("JWT ERROR:", error);
    throw new ApiError(509, "Something went wrong while generating JWTs")
  }
}

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  // find if the user exists or not
  const existingUser = await User.findOne({
    $or: [{ username }, { email }]
  })

  // user already exists
  if (existingUser) {
    throw new ApiError(409, "User with Username or Email already exists", []);
  }

  // if not, create one
  const user = await User.create({
    email,
    username,
    password,
    isEmailVerified: false
  });

  const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false });

  // sending a mail
  await sendMail({
    email: user?.email,
    subject: "Please Verify Your Email",
    mailGenContent: emailVerificationMailContent(
      user.username,
      `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`
    )
  })

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
  );

  if (!createdUser) {
    throw new ApiError(500, "Somthing went wrong while registering the user!")
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { user: createdUser },
        "User registered with verification mail sent to inbox.",
      )
    );
});

const login = asyncHandler(async (req, res) => {
  // email based login
  const { email, password } = req.body;
  if (!email) {
    throw new ApiError(400, "Email is required for login");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(400, "User does not exists!");
  }

  const isPassValid = await user.isPasswordCorrect(password);
  if (!isPassValid) {
    throw new ApiError(400, "Password is not correct! Try again.")
  }

  const { accessToken, refreshToken } = await generateAccessRefreshToken(user._id);

  const loggedUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
  );

  const options = {
    httpOnly: true, // prevents JS from reading the cookies , with document.cookies
    secure: true // and only send the cookies over HTTPS, not HTTP
  }

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedUser,
          accessToken,
          refreshToken
        },
        "User logged in successfully"
      )
    )
});

const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: "",
      },
    },
    {
      new: true
    }
  )

  const options = {
    httpOnly: true,
    secure: true
  }

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
      new ApiResponse(200, {}, "User Logged Out Successfully")
    )
});
// use the res.user middleware
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        res.user,
        "Current User Fetched Successfully!"
      )
    );
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { verificationToken } = req.params;
  if (!verificationToken) {
    throw new ApiError(400, "Email verification token is missing")
  }

  // we get back the unhashed token
  let hashedToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  const user = User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpiry: { $gt: Date.now() }
  });

  if (!user) {
    throw new ApiError(400, "Token is Invalid or Expired!")
  }

  // if the tokens are fine, remove them from the user's document
  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;

  user.isEmailVerified = true;
  user.save({ validateBeforeSave: false })

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          isEmailVerified: true
        },
        "Email is Verified"
      ),
    );
});

// if the email verification token is expired
const resendEmailVerication = asyncHandler(async (req, res) => {
  // firstly check if the user is logged in or not
  const user = User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(404, "User does not exists");
  }

  // if user is logged in, and also has a verified email
  if (user.isEmailVerified) {
    throw new ApiError(409, "User1 Already Verified");
  }
  // else repeat the process done while registering the user

  const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;

  await user.save({ validateBeforeSave: false });

  await sendMail({
    email: user?.email,
    subject: "Please Verify Your Email",
    mailGenContent: emailVerificationMailContent(
      user.username,
      `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`
    )
  })

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Mail has been sent to your mailbox"
      )
    )
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(404, "Unauthorized Access");
  }

  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(404, "Invalid Refresh Token");
    }

    // the refresh token needs to be in the database
    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(404, "Refreh Token is Expired");
    }

    const options = {
      httpOnly: true,
      secure: true
    }

    // we generate a new access and refresh token everytime
    // this is called refresh token refresh token rotation
    const { accessToken, refreshToken: newRefreshToken } = await generateAccessRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    user.save();

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newRefreshToken
          },
          "Refresh Token Refreshed"
        )
      )
  } catch (err) {
    console.error("Error while renewing refresh token: ", err);
    throw new ApiError(401, "Error while renewing refresh token")
  }
});

// password related controllers

// client -> forgots password -> posts their email address -> email is sent and a new password is created
const forgotPasswordRequest = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User with the email does not exists");
  }

  const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();

  user.forgotPasswordToken = hashedToken;
  user.forgotPasswordExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false });

  await sendMail({
    email: user?.email,
    subject: "Request for Password Reset",
    mailGenContent: forgotPasswordMailContent(
      user.username,
      `${req.protocol}://${req.get("host")}/api/forgot-password/${unHashedToken}`
    )
  })

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Password reset mail has been sent to your email address"
      )
    )
});

// taking from the forgot password
// when the client hits the email link, and enters the password, that gets updated in the database
const resetForgotPassword = asyncHandler(async (req, res) => {
  const { resetToken } = req.params;
  const { newPassword } = req.body;

  // the reset token is unhashed -> hash it to compare
  let hashedResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const user = await User.findOne({
    forgotPasswordToken: hashedResetToken,
    forgotPasswordExpiry: { $gt: Date.now() }
  });

  if (!user) {
    throw new ApiError(489, "Token is Invalid or Expired")
  }

  user.forgotPasswordExpiry = undefined;
  user.forgotPasswordToken = undefined;

  // this invokes the mongoose hook
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Password has been reset successfully"
      )
    );
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  // since the client is logged in

  const user = await User.findById(req.user?._id);

  const isPassvalid =  await user.isPasswordCorrect(oldPassword);
  if (!isPassvalid) {
    throw new ApiError(400, "Old Password is Invalid")
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Password has been changed successfully"
      )
    );
});

export {
  registerUser,
  login,
  logout,
  getCurrentUser,
  verifyEmail,
  resendEmailVerication,
  refreshAccessToken,
  forgotPasswordRequest,
  resetForgotPassword,
  changeCurrentPassword
};
