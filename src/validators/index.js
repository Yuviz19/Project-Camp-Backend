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

export {
  userRegisterValidator
}
