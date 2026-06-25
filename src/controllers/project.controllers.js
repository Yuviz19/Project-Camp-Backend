import { User } from "../models/user.models.js";
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectMember.models.js"
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/aync-handler.js";
import mongoose from "mongoose";
import { AvailableUserRoles, UserRolesEnum } from "../utils/constants.js";


const getProjects = asyncHandler(async (req, res) => {
  // get all the projects that a user is associated to
  const projects = await ProjectMember.aggregate(
    [
      // return all the documents related to user
      {
        $match: {
          user: mongoose.Types.ObjectId(req.user._id)
        }
      },
      // map the project to get their details
      {
        $lookup: {
          from: "projects",
          localField: "project",
          foreignField: "_id",
          as: "projectDetails", // returns an array of objects (most likely a single element array)
        }
      },
      // open up the array and take out the object
      {
        $unwind: "$projectDetails"
      },
      {
        $lookup: {
          from: "projectmembers",
          localField: "projectDetails._id",
          foreignField: "project",
          as: "forMembers"
        }
      },
      {
        $addFields: {
          memberCount: {
            $size: "$forMembers"
          }
        }
      },
      {
        $project: {
          _id: 0,
          role: 1,
          project: {
            _id: "$projectDetails._id",
            name: "$projectDetails.name",
            description: "$projectDetails.description",
            createdAt: "$projectDetails.createdAt",
            createdBy: "$projectDetails.createdBy",
            membersCount: "$memberCount"
          }
        }
      }
    ]
  );

  if (!projects) {
    throw new ApiError(404, "Unable to fetch projects")
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        projects,
        "User related projects fetch successfull"
      )
    )
});

const getProjectById = asyncHandler(async (req, res) => {
  // expecting the project id to come from params
  const { projectId } = req.params;
  const project = await Project.findById(projectId)

  if (!project) {
    throw new ApiError(404, "Project Not Found")
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        project,
        "Project fetched successfully"
      )
    )
});

const createProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const project = await Project.create({
    name,
    description,
    createdBy: mongoose.Types.ObjectId(req.user._id)
  });

  // promote the user to admin (the one who created the project)
  await ProjectMember.create({
    user: mongoose.Types.ObjectId(req.user._id),
    project: mongoose.Types.ObjectId(project._id),
    role: UserRolesEnum.ADMIN
  })

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        project,
        "Project was created successfully"
      )
    )

});

const updateProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const { projectId } = req.params;

  const project = await Project.findByIdAndUpdate(
    projectId,      // filter
    {               // values
      name,
      description
    },
    { new: true }   // options
  )

  if (!project) {
    throw new ApiError(404, "Project not found")
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        project,
        "Project found and updated"
      )
    )
});

const deleteProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const project = await Project.findByIdAndDelete(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found")
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Project found and deleted"
      )
    )
});

const addMembersToProject = asyncHandler(async (req, res) => {
  // we expect to get the email, role and the project id from the frontend
  const { email, role } = req.body;
  const { projectId } = req.params;

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not Found")
  }

  await ProjectMember.findByIdAndUpdate(
    {
      user: new mongoose.Types.ObjectId(user._id),
      project: new mongoose.Types.ObjectId(projectId)
    },
    {
      user: new mongoose.Types.ObjectId(user._id),
      project: new mongoose.Types.ObjectId(projectId),
      role: role
    },
    {
      upsert: true,
      new: true
    }
  )

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        {},
        "New project member added/updated"
      )
    )
});

const getProjectMembers = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project Not Found")
  }

  const projectMems = await ProjectMember.aggregate(
    [
      {
        $match: {
          project: new mongoose.Types.ObjectId(projectId)
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
          pipeline: [
            {
              $project: {
                _id: 1,
                username: 1,
                fullName: 1,
                avatar: 1
              }
            }
          ]
        }
      },
      {
        $addFields: {
          user: {
            $arrayElemAt: ["user", 0] // create a user field
            // and put the value, of user array which is at index 0
          }
        }
      },
      {
        $project: {
          project: 1,
          user: 1,
          role: 1,
          createdAt: 1,
          updatedAt: 1,
          _id: 0
        }
      }
    ]
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        projectMems,
        "project members fetched"
      )
    )
});

const updateRolesOfProject = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params;
  const { newRole } = req.body;

  if (!AvailableUserRoles.includes(newRole)) {
    throw new ApiError(400, "Invalid role")
  }

  let projectMember = await ProjectMember.findOne({
    project: new mongoose.Types.ObjectId(projectId),
    user: new mongoose.Types.ObjectId(userId)
  })

  if (!projectMember) {
    throw new ApiError(404, "project member not found")
  }

  const updatedUser = await ProjectMember.findByIdAndUpdate(
    {
      user: new mongoose.Types.ObjectId(userId),
      project: new mongoose.Types.ObjectId(projectId)
    },
    {
      role: newRole
    },
    {
      new: true
    }
  )

  if (!updatedUser) {
    throw new ApiError(400, "unable to update user")
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedUser,
        "user role updated"
      )
    )
});

const removeMembersInProject = asyncHandler(async (req, res) => {
  const { userId, projectId } = req.params;

  let projectMember = await ProjectMember.findOne({
    project: new mongoose.Types.ObjectId(projectId),
    user: new mongoose.Types.ObjectId(userId)
  });

  if (!projectMember) {
    throw new ApiError(404, "project member not found")
  }

  const deleted = await ProjectMember.findOneAndDelete({
    project: projectId,
    user: userId
  });

  if (!deleted) {
    throw new ApiError(400, "unable to delete the user")
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        deleted,
        "project member deleted successfully"
      )
    )
});

export {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addMembersToProject,
  getProjectMembers,
  updateRolesOfProject,
  removeMembersInProject
}
