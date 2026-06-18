import mongoose, { Schema } from "mongoose";
// each task has a subtask

const subTaskSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  task: {
    type: Schema.Types.ObjectId,
    ref: "Task"
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, { timestamps: true });

export const SubTask = mongoose.model("SubTask", subTaskSchema);
