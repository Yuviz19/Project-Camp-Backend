import { Router } from "express";
import { getProjects, getProjectById, createProject, updateProject, deleteProject, addMembersToProject, getProjectMembers, updateRolesOfProject, removeMembersInProject } from "../controllers/project.controllers.js";
import { validate } from "../middlewares/validator.middleware.js";
import { createProjectValidator, updateProjectValidator, addMembersToProjectValidator, updateUserRoleValidator } from "../validators/index.js"
import { verifyJWT, validateProjectPermission } from "../middlewares/auth.middleware.js";
import { AvailableUserRoles, UserRolesEnum } from "../utils/constants.js";

const router = Router();

router.use(verifyJWT)
// now all the routes will contain the verifyJWT middleware

router.route("/")
  .get(getProjects)
  .post(createProjectValidator(), validate, createProject);

router.route("/:projectId")
  .get(validateProjectPermission(AvailableUserRoles), getProjectById)
  .put(validateProjectPermission([UserRolesEnum.ADMIN]), updateProjectValidator(), validate, updateProject)
  .delete(validateProjectPermission([UserRolesEnum.ADMIN]), deleteProject);

router.route("/:projectId/members")
  .get(getProjectMembers)
  .post(validateProjectPermission([UserRolesEnum.ADMIN]), addMembersToProjectValidator(), validate, addMembersToProject)

router.route("/:projectId/members/:userId")
  .put(validateProjectPermission([UserRolesEnum.ADMIN]), updateUserRoleValidator(), validate, updateRolesOfProject)
  .delete(validateProjectPermission([UserRolesEnum.ADMIN]), removeMembersInProject)

export default router;
