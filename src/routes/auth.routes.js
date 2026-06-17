import { Router } from "express";
import { registerUser, login, logout, getCurrentUser, verifyEmail, resendEmailVerication, refreshAccessToken, forgotPasswordRequest, resetForgotPassword, changeCurrentPassword } from "../controllers/auth.controllers.js";
import { validate } from "../middlewares/validator.middleware.js";
import { userRegisterValidator, userLoginValidator, userChangePasswordValidator, userForgotPasswordRequestValidator, userResetForgotPasswordValidator } from "../validators/index.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// usecured Routes
router.route("/register").post(userRegisterValidator(), validate, registerUser) // validator, middleware and register function
router.route("/login").post(userLoginValidator(), validate, login);
router.route("/verify-email/:verificationToken").get(verifyEmail);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/forgot-password").post(userForgotPasswordRequestValidator(), validate, forgotPasswordRequest);
router.route("/reset-password/:resetToken").post(userResetForgotPasswordValidator(), validate, resetForgotPassword);

// secured Routes
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/logout").post(verifyJWT, logout);
router.route("/resend-email-verification").post(verifyJWT, resendEmailVerication);
router.route("change-password").post(verifyJWT, userChangePasswordValidator(), validate, changeCurrentPassword);

export default router
