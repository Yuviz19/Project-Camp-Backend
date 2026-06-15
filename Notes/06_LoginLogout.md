# Login 

## Login User with Tokens and Cookie data
- HOW TO?
  - take data from user 
  - validate it
  - check if user exists
  - check if password is correct
  - Generate tokens
  - send tokens in cookies

- by default express does not takes care of cookies, parses them as raw data
- so we use a package "cookie-parser", to get the cookies in object format

```md
- Need of cookies?
  - HTTP is stateless (forgets stuffs)
  - so we store tokens in form of cookies in the user's browser
  - so that whenever a user tries to login or does some authenticated stuff,
  - they must not enter thier credentials again and again
  - cookies are sent automatically with the header 
```

- to use "cookie-parser", install it and in the app.js file, import it
- "app.use("cookieParser")"

- writing the userLogin controllers
```js
const login = asyncHandler(async (req, res) => {
  // email based login
  const { email, password } = req.body;
  if (!email) {
    throw new ApiError(400, "Email is required for login");
  }

  // check if user exists or not
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(400, "User does not exists!");
  }

  // verify the password
  const isPassValid = await user.isPasswordCorrect(password);
  if (!isPassValid) {
    throw new ApiError(400, "Password is not correct! Try again.")
  }

  // generate the tokens
  const { accessToken, refreshToken } = await generateAccessRefreshToken(user._id);

  // get the logged user, without some extra info
  const loggedUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
  );

  // set config options for cookies ('cookie-parser')
  const options = {
    httpOnly: true, // prevents JS from reading the cookies , with document.cookies
    secure: true // and only send the cookies over HTTPS, not HTTP
  }

  // return the response with the cookies and json data 
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedUser,
          accessToken,
          refreshToken
        },
        "User logged in successfully"
      )
    )
});
```
- then write the validator for the login data
- since we are omly accepting email and password, validate them

- for the middleware, we can use the same middleware that we used for registering the user

- then route them with validator > middleware > login function

## Verification of JWTs - Auth Middleware
- whenever a client sends a request to the server, an access token is also sent
  - without the accesstoken, we do not know if a client is loggedIn or not
- so with every request, this access token is sent, and a response is sent back
- so we write a middleware that checks if a user is logged in or not (with every request)

-- how does an access token reaches a user 
- one method is via cookies (this is not an option for mobile apps)
- and the other is via header
  - with Authorization -> key
  - and Bearer Token -> value (access token sent via bearer token)
- auth middleware ->
```js
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/aync-handler.js";
import jwt from "jsonwebtoken";

export verifyJWT = asyncHandler(async(req, res, next) => {
  // we get an encoded token
  const token = req.cookies?.accessToken || req.header("Authorization").replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized Request");
  }

  // if we get this token, we decode it
  try {
    const decodedToken = jwt.verify(token, process.ACCESS_TOKEN_SECRET);
    // now we have the same object that we passed onto the signing of the jwt
    // refine the user model
    const user = await User.findById(decodedToken._id).select(
      "-password - refreshToken - emailVerificationToken - emailVerificationExpiry"
    )

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    // add a new property to req, so that we can use it in the future
    req.user = user;
    // move to the next middleware
    next();
  } catch (err) {
    console.error("Error while JWT verification: ", err);
    throw new ApiError(401, "Invalid Access Token");
  }
})
```
- the FLOW
Access Token
      ↓
jwt.verify()
      ↓
Token valid?
      ↓
Extract _id
      ↓
Find user in DB
      ↓
req.user = user

## A common pattern in Express
1. Multer
  - gives access to req.file()
2. CookieParser
  - gives access to req.cookies()
3. Express JSON Middleware
  - this gives access to req.body()


## Logging a User out
- the client sends a request to the server to log them out
- and the access token is sent and auth middleware is run
- writing the logout logic in the auth.controller
