import { Router } from "express";
import { registerUser, login, logout } from "../controllers/auth.controllers.js";
import { validate } from "../middlewares/validator.middleware.js";
import { userRegisterValidator, userLoginValidator } from "../validators/index.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.route("/register").post(userRegisterValidator(), validate, registerUser) // validator, middleware and register function
router.route("/login").post(userLoginValidator(), validate, login);
router.route("/logout").post(verifyJWT, logout);

export default router
