import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/aync-handler.js";

// writing a healthcheck api, for checking if the app is running fine.

/*
const healthcheck = async (req, res, next) => {
  try {
    // if this function exists
    const user = await getUserfromDB();
    res
      .status(200)
      .json(new ApiResponse(200, { msssage: "Server is running" }));
  } catch (err) {
    next(err);
  }
}
*/

const healthcheck = asyncHandler(async (req, res) => {
  res
    .status(200)
    .json(new ApiResponse(200, { message: "Server is Running" }));
});

export { healthcheck };
