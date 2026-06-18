import mongoose, { Schema } from "mongoose";
import { AvailableUserRoles, UserRolesEnum } from "../utils/constants.js";

// this schema is for the users of a certain project (memebers workking on a project)
const projectMemberSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: "Project",
    required: true
  },
  role: {
    type: String,
    enum: AvailableUserRoles, // role must be any of the ones available
    default: UserRolesEnum.MEMBER
  }
}, { timestamps: true });

export const ProjectMember = mongoose.model("ProjecMembers", projectMemberSchema);
