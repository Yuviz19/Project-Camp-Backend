import { body } from "express-validator";

const userRegisterValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is Required!")
      .isEmail()
      .withMessage("Email is Invalid"),
    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username is Required")
      .isLowercase()
      .withMessage("Username should be in lowercase")
      .isLength({min: 3})
      .withMessage("Username must be 3 characters long"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is Required"),
    body("fullName")
      .optional()
      .trim()
      .notEmpty()
  ]
}

const userLoginValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is Required")
      .isEmail()
      .withMessage("Invalid Email format"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is Required")
  ];
}

const userChangePasswordValidator = () => {
  return [
    body("oldPassword")
      .trim()
      .notEmpty()
      .withMessage("Old Password is Required"),
    body("newPassword")
      .trim()
      .notEmpty()
      .withMessage("A new Password is Required")
  ]
}

const userForgotPasswordRequestValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is Required")
      .isEmail()
      .withMessage("A valid email is Required")
  ]
}

const userResetForgotPasswordValidator = () => {
  return [
    body("newPassword")
      .trim()
      .notEmpty()
      .withMessage("A new password is Required")
  ]
}

export {
  userRegisterValidator,
  userLoginValidator,
  userChangePasswordValidator,
  userForgotPasswordRequestValidator,
  userResetForgotPasswordValidator
};
