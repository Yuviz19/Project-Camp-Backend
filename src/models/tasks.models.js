import mongoose, { Schema } from "mongoose";
import { AvailableTaskStatus, TaskStatusEnum } from "../utils/constants";

const taskSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  project: {
    type: Schema.Types.ObjectId,
    ref: "Project",
    required: true
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  assignedBy: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  status: {
    filename: String,
    type: String,
    enum: AvailableTaskStatus,
    default: TaskStatusEnum.TODO
  },
  attachments: {
    // can have multiple attachments in an array
    // they are strings for a general purpose
    type: [{
      url: String,
      mimetype: String,
      size: Number
    }],
    default: []
  }
},{timestamps: true})

export const Task = mongoose.model("Task", taskSchema);
