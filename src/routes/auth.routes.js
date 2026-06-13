import { Router } from "express";
import { registerUser } from "../controllers/auth.controllers.js";
import { validate } from "../middlewares/validator.middleware.js";
import { userRegisterValidator } from "../validators/index.js";

const router = Router();
router.route("/register").post(userRegisterValidator(), validate, registerUser)
// userRegisterValidator is from the validator
// validate is a middleware
// and register user is the function that is run to do the normal stuff of registering a user

export default router
