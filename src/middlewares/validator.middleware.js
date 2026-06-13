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
