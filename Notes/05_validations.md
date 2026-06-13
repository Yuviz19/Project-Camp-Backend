# Validation
- This is the process where we need to validate the data
  - that is being sent in by the user before using it

- some libraries that are used are 
1. Zod
2. yup
3. express-validator
- their sole purpose it to validate the data, give proper errors.. etc

## Writing Middleware
- middleware are functions that executes sequentially during the request, response cycle
- it acts as a pipeline or checkpoint, sitting directly between incoming raw client and route handler

## Application
- writing a middleware
- writing validators for incoming data
- and implementing them in the routes

## How the Process looks like
- request -> validator -> validator middlware -> controller -> response

### Writinh a Validator
```js
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
```
- this is not complex to write, as this is just like a security check point to the app

- now we write the validate middleware to catch the errors (if any) and format the errors
```js
import { validationResult } from "express-validator";
import { ApiError } from "../utils/api-error.js";

export const validate = (req, res) => {
  // read the results sent by the validator
  const errors = validationResult(req);
  // if no error is found, continue
  if (errors.isEmpty()) return;

  // if error is found
  const extractedErrors = [];
  errors.array().map((err) => extractedErrors.push({ [err.path]: err.msg }));
  throw new ApiError(
    422,
    "Recieved Data is not Valid",
    extractedErrors
  )
}
```
- now top put the validator and the middleware in the path/route
```js
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

```
