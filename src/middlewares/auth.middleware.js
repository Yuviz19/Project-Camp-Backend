import { User } from "../models/user.models.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/aync-handler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async(req, res, next) => {
  // we get an encoded token
  const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized Request");
  }

  // if we get this token, we decode it
  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    // now we have the same object that we passed onto the signing of the jwt
    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    )

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    // add a new property to req, so that we can use it in the future
    req.user = user;
    next();
  } catch (err) {
    console.error("Error while JWT verification: ", err);
    throw new ApiError(401, "Invalid Access Token");
  }
})
