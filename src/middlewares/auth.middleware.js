import { User } from "../models/user.models.js";
import { ProjectMember } from "../models/projectMember.models.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/aync-handler.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export const verifyJWT = asyncHandler(async (req, res, next) => {
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
});

// asking what users can do the stuff
export const validateProjectPermission = (role = []) => {
  return asyncHandler(async (req, res, next) => {
    const { projectId } = req.params;
    if (!projectId) {
      throw new ApiError(404, "Project Id is missing")
    }

    const project = await ProjectMember.findOne({
      project: new mongoose.Types.ObjectId(projectId),
      user: new mongoose.Types.ObjectId(req.user._id)
    })

    if (!project) {
      throw new ApiError(404, "Project not found")
    }

    const givenRole = project?.role;
    req.user.role = givenRole;

    // if the roles match the specificified roles. we allow them
    if (!role.includes(givenRole)) {
      throw new ApiError(403, "You do not have permission to perform this action")
    }

    // move to the next step (another middleware or conroller)
    next()
  });
};
