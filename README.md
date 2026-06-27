# Project Camp Backend

A RESTful backend for collaborative project management built with **Node.js**, **Express.js**, and **MongoDB**. It provides secure authentication, role-based access control, project collaboration, task management, subtasks, project notes, and file attachments through a modular API architecture.

## Features

### Authentication & Authorization

* JWT Authentication with Access & Refresh Tokens
* Email Verification
* Forgot & Reset Password
* Secure Password Hashing using bcrypt
* Cookie-based Authentication
* Role-Based Access Control (RBAC)

### Project Management

* Create, update and delete projects
* Invite members to projects
* Manage project member roles
* View all projects associated with a user
* Member count aggregation using MongoDB Aggregation Pipeline

### Task Management

* Create and assign tasks
* Update task status
* Upload multiple attachments
* Delete tasks with automatic cleanup of subtasks and uploaded files
* Retrieve detailed task information with assigned user details

### Subtask Management

* Create subtasks
* Update completion status
* Delete subtasks
* Permission-based access

### Security

* JWT Authentication
* Refresh Token Rotation
* Input Validation using Express Validator
* Permission Middleware
* Protected Routes
* Secure File Uploads with Multer

---

## Tech Stack

### Backend

* Node.js
* Express.js

### Database

* MongoDB
* Mongoose ODM

### Authentication

* JSON Web Tokens (JWT)
* bcrypt

### File Uploads

* Multer

### Validation

* express-validator

### Email Services

* Nodemailer
* Mailgen

### Utilities

* dotenv
* cookie-parser
* cors

### Development

* Nodemon
* Prettier

---

## Folder Structure

```md
.
├── package.json
├── package-lock.json
├── PRD.md
├── public
│   └── images
├── README.md
└── src
    ├── app.js
    ├── controllers
    │   ├── auth.controllers.js
    │   ├── healthcheck.controllers.js
    │   ├── project.controllers.js
    │   └── task.controllers.js
    ├── db
    │   └── database.js
    ├── index.js
    ├── middlewares
    │   ├── auth.middleware.js
    │   ├── multer.middleware.js
    │   └── validator.middleware.js
    ├── models
    │   ├── notes.models.js
    │   ├── projectMember.models.js
    │   ├── project.models.js
    │   ├── subtasks.models.js
    │   ├── tasks.models.js
    │   └── user.models.js
    ├── routes
    │   ├── auth.routes.js
    │   ├── healthcheck.routes.js
    │   ├── project.routes.js
    │   └── task.routes.js
    ├── utils
    │   ├── api-error.js
    │   ├── api-response.js
    │   ├── aync-handler.js
    │   ├── constants.js
    │   └── mail_gen.js
    └── validators
        └── index.js

11 directories, 30 files
```

---

## Database Models

The backend is built around six primary MongoDB collections:

### User

Stores user account information and authentication data.

**Responsibilities**

* User authentication
* Email verification
* Password management
* Refresh token management

---

### Project

Represents a collaborative workspace.

**Fields**

* Name
* Description
* Created By
* Timestamps

---

### ProjectMember

Acts as the junction collection between **Users** and **Projects**, implementing Role-Based Access Control (RBAC).

**Responsibilities**

* Project membership
* User roles (`admin`, `project_admin`, `member`)
* Permission management

---

### Task

Represents a unit of work within a project.

**Features**

* Task assignment
* Status tracking
* Multiple file attachments
* Task creator tracking

---

### SubTask

Represents smaller units of work belonging to a task.

**Features**

* Completion tracking
* Creator information
* Linked to a parent task

---

## Permission Matrix

| Feature                    | Admin | Project Admin | Member |
| -------------------------- | ----- | ------------- | ------ |
| Create Project             | ✓     | ✗             | ✗      |
| Update/Delete Project      | ✓     | ✗             | ✗      |
| Manage Project Members     | ✓     | ✗             | ✗      |
| Create/Update/Delete Tasks | ✓     | ✓             | ✗      |
| View Tasks                 | ✓     | ✓             | ✓      |
| Update Subtask Status      | ✓     | ✓             | ✓      |
| Create/Delete Subtasks     | ✓     | ✓             | ✗      |
| Create/Update/Delete Notes | ✓     | ✗             | ✗      |
| View Notes                 | ✓     | ✓             | ✓      |

## API Endpoints

- API Endpoints are mentioned in detail in PRD document

## Future Improvements

* Store attachments using cloud storage (AWS S3/Cloudinary) instead of the local filesystem.
* Add pagination and filtering for projects, tasks, and notes.
* Introduce automated testing for API endpoints.
* Containerize the application using Docker for easier deployment.
* Generate interactive API documentation with Swagger/OpenAPI.
* Add real-time notifications for task assignments and project updates.
