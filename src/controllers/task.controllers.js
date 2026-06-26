import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/aync-handler.js";
import { Task } from "../models/tasks.models.js";
import { SubTask } from "../models/subtasks.models.js";
import { ProjectMember } from "../models/projectMember.models.js";
import { Project } from "../models/project.models.js";
import { User } from "../models/user.models.js";
import mongoose from "mongoose";
import { AvailableUserRoles, UserRolesEnum } from "../utils/constants.js";

const getTask = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found")
  }

  const tasks = await Task.find({
    project: new mongoose.Types.ObjectId(projectId)
  }).populate("assignedTo", "avatar username fullname");

  if (!tasks) {
    throw new ApiError(404, "Unable to fetch the tasks")
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
  const task = await Task.aggregate([
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

  if (!task || task.length === 0) {
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
      url: `${process.env.SERVER_URL}/images/${file.originalname}`,
      mimetype: file.mimetype,
      size: file.size
    }
  });

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
  // test
});

const deleteTask = asyncHandler(async (req, res) => {
  // test
});

const createSubTask = asyncHandler(async (req, res) => {
  // test
});

const updateSubTask = asyncHandler(async (req, res) => {
  // test
});

const deleteSubTask = asyncHandler(async (req, res) => {
  // test
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
