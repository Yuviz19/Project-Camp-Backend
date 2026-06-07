## Writing a HealthCheck

#### a basic flow of an express app
- we write the logic in the controllers directory
- we give the routes in the routes directory
- and then connect the routes via the app.js

#### Writing a HealthCheck
- create a healthcheck.controllers.js file
  - for the response import the ApiResponse from the utils.
  - create a function healthcheck 
  ```js
  const healthcheck = (req, res) => {
    try {
      res
        .status(200)
        .json(new ApiResponse(200, { msssage: "Server is running" }));
    } catch (err) {}
  }
  export { healthcheck };
  ```
  - now this logic can be used in the routes file.

- create a healthcheck.routes.js
  - import { Router } from "express"
  - and also import the healthcheck from controllers
  - make a router object from the Router

```js 
router.route("/").get(healthcheck);
export default router;
```

- now in the app.js
  - generally written below the cors and express config
```js
// Import routes
import healthCheckRouter from "./routes/healthcheck.routes.js";
app.use("/api/v1/healthcheck", healthCheckRouter);
```

- what does this mean?
  - we wrote a middleware to route it to the healthcheck + '/'
  - the use method is used, it tells express that whenever a route starts with 
  "api/v1/healthcheck" - route it to healthCheckRouter (used as default, so can be rename-able)

  - why the naming clash? Different in app and different in router file
  - this is done to pass a generalised route in the app.js and then mount a custom route in the routes file.

#### Better Error Catch with Async-Handler
- instead of writing a try catch block within the controller
- u can write a utility in utils, to handle, and replace the try catch block

```js
//higher order function
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise
      .resolve(requestHandler(req, res, next))
      .catch((err) => next(err));
  };
}

export { asyncHandler };
```

- and in the controller, import the asyncHandler

```js 
const healthcheck = asyncHandler(async (req, res) => {
  res
    .status(200)
    .json(new ApiResponse(200, { message: "Server is Running" }));
});
```
