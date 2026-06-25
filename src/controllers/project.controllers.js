import { User } from "../models/user.models.js";
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectMember.models.js"
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/aync-handler.js";
import mongoose from "mongoose";
import { UserRolesEnum } from "../utils/constants.js";


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
  // get project by ID
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
        "",
        "Project found and deleted"
      )
    )
});

const addMembersToProject = asyncHandler(async (req, res) => {
  // adding memeberd to project
});

const getProjectMembers = asyncHandler(async (req, res) => {
  // fetch the memebers of the project
});

const updateRolesOfProject = asyncHandler(async (req, res) => {
  // update the roles of the users in a project
});

const removeMembersInProject = asyncHandler(async (req, res) => {
  // removal of project members from a project
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
