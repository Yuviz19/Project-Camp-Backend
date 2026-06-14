import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/aync-handler.js";
import { emailVerificationMailContent, sendMail } from "../utils/mail_gen.js";

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

export { registerUser, login };
