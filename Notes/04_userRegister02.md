## Registering a User (Authentication)
- to prove who you are?
- refer to the file 'controllers/auth.controllers.js'

```js
const generateAccessRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    // don't touch any other feild
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(509, "Something went wrong while generating JWTs")
  }
}
```
- generates the access and refresh token
1. Find user by ID.
2. Generate access token.
3. Generate refresh token.
4. Save refresh token in database.
5. Return both tokens.

```js
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  // find if the user exists or not
  const existingUser = await User.findOne({
    $or: [{ username }, { email }]
  })

  // user already exists
  if (existingUser) {
    throw new ApiError(409, "User with Username or Email already exists", []);
  }

  // if not, create one
  const user = await User.create({
    email,
    username,
    password,
    isEmailVerified: false
  });

  const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false });

  // sending a mail
  await sendMail({
    email: user?.email,
    subject: "Please Verify Your Email",
    mailGenContent: emailVerificationMailContent(
      user.username,
      `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`
    )
  })

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
  );

  if (!createdUser) {
    throw new ApiError(500, "Somthing went wrong while registering the user!")
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { user: createdUser },
        "User registered with verification mail sent to inbox.",
      )
    );
});
```
-> register a user
-> create an email verification token
-> sends a verification mail
-> returns the created user

1. Extract the user data
  - const { username, email, password, role } = req.body;
2. Check if user already exists
```js
const ifUserExists = await User.findOne({
  $or: [{ username }, { email }]
});
```
- throw a conflict error, if a user already exists
3. Create a user using User.create() method
- creates a new database entry
```js
const user = await User.create({
  email,
  username,
  password,
  isEmailVerified: false
});
```

!NOTE => the password hashing is done using the mongoose hooks
4. Get the Temporary tokens, from the user model file
```js
const {
  unHashedToken,
  hashedToken,
  tokenExpiry
} = user.generateTemporaryToken();
```
- unHashedToken -> sent to the user's mail
- hashedToken -> stored in db
- store them into the db using
```js
user.emailVerificationToken = hashedToken;
user.emailVerificationExpiry = tokenExpiry;
```
5. Save without validation
```js
await user.save({
  validateBeforeSave: false
});
```
- this tells mongoose to save the user object while only updating the specific entries
- hence skips the schema validation
6. send a verification mail
```js
await sendMail({
  email: user?.email,
  subject: "Please Verify Your Email",
  mailGenContent: emailVerificationMailContent(
    user.username,
    `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`
  )
})
```
- call the sendMail from the mail_gen from utils
- and pass the options object that was promised in the mail_gen file
- VerificationUrl -> used to direct to a certain website to verify
  - `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`
  - req.protocol -> http or https
  - req.get("host") -> domain name
  - unHashedToken -> verification token
7. fetch clean user data
```js 
const createdUser = await User.findById(user._id).select(
  "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
);
```
- retrieves the newly created user, but without the given attributes
8. Verify the retrieval
```js
if (!createdUser) {
  throw new ApiError(
    500,
    "Something went wrong while registering the user!"
  )
}
```
- ensures that the user was successfully fetched
9. Send Response Back
