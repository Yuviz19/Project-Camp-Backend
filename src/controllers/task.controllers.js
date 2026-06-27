import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/aync-handler.js";
import { Task } from "../models/tasks.models.js";
import { SubTask } from "../models/subtasks.models.js";
import { ProjectMember } from "../models/projectMember.models.js";
import { Project } from "../models/project.models.js";
import { User } from "../models/user.models.js";
import mongoose from "mongoose";
import fs, { unlink } from "node:fs/promises";

const getTask = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found")
  }

  const tasks = await Task.find({
    project: new mongoose.Types.ObjectId(projectId)
  }).populate("assignedTo", "avatar username fullname");

  if (tasks.length === 0) {
    return res
      .status(200)
      .jsone(
        new ApiResponse(
          200,
          [],
          "No tasks were found"
        )
      )
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        tasks,
        "tasks fetched successfully"
      )
    )
});

const getTaskbyId = asyncHandler(async (req, res) => {
  // if someone is clicking on a particular task
  const { taskId } = req.params;
  const [task] = await Task.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(taskId)
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "assignedTo",
        foreignField: "_id",
        as: "assignedTo",
        pipeline: [
          {
            $project: {
              _id: 1,
              username: 1,
              fullname: 1,
              avatar: 1
            }
          }
        ]
      }
    },
    {
      $addFields: {
        assignedTo: {
          $arrayElemAt: ["$assignedTo",0]
        }
      }
    },
    {
      $lookup: {
        from: "subtasks",
        localField: "_id",
        foreignField: "task",
        as: "subtasks",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "createdBy",
              foreignField: "_id",
              as: "createdBy",
              pipeline: [
                {
                  $project: {
                    _id: 1,
                    username: 1,
                    fullname: 1,
                    avatar: 1
                  }
                }
              ]
            }
          },
          {
            $addFields: {
              createdBy: {
                $arrayElemAt: ["$createdBy",0]
              }
            }
          }
        ]
      }
    },
  ]);

  if (!task) {
    throw new ApiError(404, "Task not found")
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        task,
        "task fetched successfully"
      )
    )
});

const createTask = asyncHandler(async (req, res) => {
  const { title, description, assignedTo, status } = req.body;
  const { projectId } = req.params;
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found")
  }

  const files = req.files || [];
  const attachments = files.map((file) => {
    return {
      filename: file.filename,
      url: `${process.env.SERVER_URL}/images/${file.filename}`,
      mimetype: file.mimetype,
      size: file.size
    }
  });

  const user = await User.findOne({
    _id: new mongoose.Types.ObjectId(assignedTo)
  })

  if (!user) {
    throw new ApiError(404, "User does not exists")
  }

  if (assignedTo) {
    const membership = await ProjectMember.findOne({
      user: new mongoose.Types.ObjectId(assignedTo),
      project: new mongoose.Types.ObjectId(projectId)
    });
  }

  if (!membership) {
    throw new ApiError(404, "No such user found in project")
  }

  const task = await Task.create({
    title,
    description,
    project: new mongoose.Types.ObjectId(projectId),
    assignedTo: assignedTo ? new mongoose.Types.ObjectId(assignedTo) : undefined,
    assignedBy: new mongoose.Types.ObjectId(req.user._id),
    attachments,
  });

  if (!task) {
    throw new ApiError(400, "Unable to create the task")
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        task,
        "task created successfully"
      )
    )
});

const updateTask = asyncHandler(async (req, res) => {
  const { projectId, taskId } = req.params;
  const { newTitle, newDescription, newStatus, assignedTo } = req.body;

  const updateFields = {};

  if (newTitle) {
    updateFields.title = newTitle;
  }

  if (newDescription) {
    updateFields.description = newDescription;
  }

  if (newStatus) {
    updateFields.status = newStatus;
  }

  const files = req.files || [];
  const attachments = files.map((file) => {
    return {
      filename: file.filename,
      url: `${process.env.SERVER_URL}/images/${file.filename}`,
      mimetype: file.mimetype,
      size: file.size
    }
  });

  const task = await Task.findOne({
    _id: new mongoose.Types.ObjectId(taskId),
    project: new mongoose.Types.ObjectId(projectId)
  });

  if (!task) {
    throw new ApiError(404, "Unable to fetch taskId")
  }

  if (assignedTo) {
    const member = await ProjectMember.findOne({
      user: new mongoose.Types.ObjectId(assignedTo),
      project: new mongoose.Types.ObjectId(projectId)
    })

    if (!member) {
      throw new ApiError(404, "Unable to find the user in project")
    }

    updateFields.assignedTo = assignedTo;
  }

  if (Object.keys(updateFields).length === 0 && attachments.length === 0) {
    throw new ApiError(400, "No fields provided to update");
  }

  const updatedTask = await Task.findOneAndUpdate({
    _id: new mongoose.Types.ObjectId(taskId),
    project: new mongoose.Types.ObjectId(projectId)
  },
  {
    $set: updateFields,
    $push: {
      attachments: {
        $each: attachments
      }
    }
  },
  {
    new: true
  })

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedTask,
        "Task was updated successfully"
      )
    )
});

const deleteTask = asyncHandler(async (req, res) => {
  const { projectId, taskId } = req.params;
  const task = await Task.findOne({
    _id: new mongoose.Types.ObjectId(taskId),
    project: new mongoose.Types.ObjectId(projectId)
  });

  if (!task) {
    throw new ApiError(404, "Task not found")
  }

  for (const file of task.attachments) {
    try {
      await unlink(`./public/images/${file.filename}`);
    } catch (err) {
      console.error(err)
    }
  }

  await SubTask.deleteMany({
    task: new mongoose.Types.ObjectId(taskId)
  })

  await Task.findOneAndDelete({
    _id: taskId,
    project: projectId
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Task deleted successfully"
      )
    )
});

const createSubTask = asyncHandler(async (req, res) => {
  const { projectId, taskId } = req.params;
  const { title, description } = req.body;

  const task = await Task.findOne({
    project: new mongoose.Types.ObjectId(projectId),
    _id: new mongoose.Types.ObjectId(taskId)
  })

  if (!task) {
    throw new ApiError(404, "Task not found")
  }

  const subtask = await SubTask.create({
    title,
    description,
    task: new mongoose.Types.ObjectId(taskId),
    isCompleted: false,
    createdBy: new mongoose.Types.ObjectId(req.user._id)
  });

  if (!subtask) {
    throw new ApiError(400, "Unable to create subtask")
  }

  return res
    .status(201)
    .json(
      (
        new ApiResponse(
          201,
          subtask,
          "New subatask created"
        )
      )
    )
});

const updateSubTask = asyncHandler(async (req, res) => {
  const { projectId, subTaskId } = req.params;

  // is subtask valid
  const subtask = await SubTask.findById(subTaskId)
  if (!subtask) {
    throw new ApiError(404, "SubTask not found")
  }

  // finding the task and checking if it belongs to the correct project
  const TaskId = subtask.task;
  const task = await Task.findOne({
    _id: new mongoose.Types.ObjectId(TaskId),
    project: new mongoose.Types.ObjectId(projectId)
  })
  if (!task) {
    throw new ApiError(404, "No such task exists in project")
  }

  const { title, description, isCompleted } = req.body;

  if (Object.keys(updateFields).length === 0) {
    throw new ApiError(400, "No fields provided");
  }

  const updateFields = {};
  if (title) {
    updateFields.title = title;
  }
  if (description) {
    updateFields.description = description;
  }
  if (isCompleted !== undefined) {
    updateFields.isCompleted = isCompleted;
  }

  const newSubTask = await SubTask.findOneAndUpdate({
    _id: new mongoose.Types.ObjectId(subTaskId)
  }, updateFields, {
    new: true
  })

  if (!newSubTask) {
    throw new ApiError(400,"Unable to update the subtask")
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        newSubTask,
        "Updated SubTask"
      )
    )
});

const deleteSubTask = asyncHandler(async (req, res) => {
  const { projectId, subTaskId } = req.params;
  const subtask = await SubTask.findById(subTaskId);
  if (!subtask) {
    throw new ApiError(404, "Unable to fetch subtask")
  }

  const task = await Task.findOne({
    _id: new mongoose.Types.ObjectId(subtask.task),
    project: new mongoose.Types.ObjectId(projectId)
  })

  if (!task) {
    throw new ApiError(404, "Unable to fetch Task")
  }

  const deletedSubTask = await SubTask.deleteOne(subTaskId);

  if (!deletedSubTask) {
    throw new ApiError(400, "Unable to delete SubTask")
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "SubTask deleted successfully"
      )
    )
});

export {
  deleteSubTask,
  updateSubTask,
  createSubTask,
  deleteTask,
  updateTask,
  createTask,
  getTaskbyId,
  getTask
}
