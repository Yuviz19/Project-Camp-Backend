export const UserRolesEnum = {
  ADMIN: "admin",
  PROJECT_ADMIN: "project_admin",
  MEMBER: "memeber"
}

// returns an array of the values, from the UserRolesEnum
export const AvailableUserRoles = Object.values(UserRolesEnum);

export const TaskStatusEnum = {
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  DONE: "done"
}

export const AvailableTaskStatus = Object.values(TaskStatusEnum);
