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
