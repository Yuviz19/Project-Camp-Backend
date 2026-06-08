# JWT (JSON Web Tokens) 
- for every request a user/browser makes, u need to have some authentication and authorization mechanism
  - to check if a user registered or not, respond back.

- a long string exists, and with every request, the user sends the string, to prove that the user is 
  - a valid user
  - still validated

- this is done by JWT
- after logging-in, with each subsequent request, the tokens are also passed

- that's why in the CORS config, we wrote "authorization" as allowed headers.

#### Structure of a JWT
- in its compact form, it has
  - Header
  - Payload
  - Signature
- xxxxx.yyyyy.zzzzz

- Header - generally consists of 2 parts-
  - type of token (which is JWT)
  - and the signing algorithm used (eg. HMAC SHA256, RSA)
  ```JSON
  {
    "alg": "HMAC",
    "typ": "JWT"
  }
  ```

- Payload - this is the second part of the token and it contains, 
  - the information, like userID, email etc..
  - keep this short to avoid a large payload
  - this is then encrypted
  ```JSON
  {
  "sub": "123456",
  "name": "John Doe",
  "admin": true
  }
  ```

  - this info is then Base64Url encoded

- Signature - makes sure of the encryption
  - to create it, you need to take the encoded header and payload, a secret and the algorithm specified in header
  - eg using the HMACSHA256(
    base64UrlEncode(header) + '.' +
    base64UrlEncode(payload), 
  secret)

## Designing Access and Refresh Tokens
- these are JWTs, but with a different use case
- we know that tokens are just long strings
  - these are of 2 types
  1. With Data (Stateless)(JWTs)
    - there is some data attached to it (but encrypted)
  2. Without Data (Stateful)(random strings)
    - a string of a random characters, used to verify stuff for a single time
    - think of this as the forgot password mechanism where a random string is sent to allow the use of a single utility for a single time

- The 2 major use cases of with data token are - 
  1. Access Token
  2. Refresh Token
  - the way of generating them, and using them is majorly the same,
  - the difference lies in the time for which they are lived, and the use case

- Access Tokens -
  - short lived (5-15 mins)
  - sent with every request
  - contains:
    - userID
    - roles/permissions
  - used for - authorization (what are u allowed to do)
  - high risk of exposure
  - stored in memory/client
  - Revocation - Hard

- Refresh Token -
  - long lived (days/weeks)
  - NOT sent with every request
  - used only to:
    - get a new access token
  - low risk of exposure
  - stored in HttpOnly cookie / DB
  - its Revocation must be conrollable

#### Writing JWTs
1. in .env file we need to write 2 things
  - the TOKEN_SECRET=..., a piece of info that only the server knows 
    - the secret is used to sign and verify the tokens
    - u can generate the secret with 
    node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
    - with TOKEN_EXPIRY=... > can be 1h,1d,5m...
  - this has to be done for both ACCESS and REFRESH tokens

2. add the generate methods to the user document
```js
userSchema.methods.generataAccessToken = function() {
  return jwt.sign(
    {
      // payload
      _id: this._id,
      email: this.email,
      username: this.username
    },
    // signing
    process.env.ACCESS_TOKEN_SECRET,
    // expiration of the token
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  )
}

userSchema.methods.generateRefreshToken = function() {
  return jwt.sign(
    {
      _id: this, _id,
      email: this.email,
      username: this.username
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  )
}

// creation of a temporary key
userSchema.methods.generateTemporaryToken = function() {
  const unHashedToken = crypto.randomBytes(20).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(unHashedToken)
    .digest("hex")

  const tokenExpiry = Date.now() + (20 * 50 * 1000) // 20 min
  return { unHashedToken, hashedToken, tokenExpiry }
}
```

