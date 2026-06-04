# NOTES
- since it is a NODE project

## Steps to initialize a Project
#### Make a PRD (Project Requirement Doc)
#### Setup a project
  - 'npm init' - initialize a node project
    - this makes node project
  - now u know what to do after the initializing of the project.
  - make an index.js file (whatever is said)
  - the package.json file becomes like a managing area for the project
  - for importing modules there are 2 keywords
    1. require syntax - commonjs
    2. import syntax - module
    - then in package.json file - "type": "module"
  - add git and prettier
    - install prettier - npm install --save-dev --save-exact prettier
      - then apply prettier - npx prettier . --write
      - to health check - change the flag to --check
  - make a .prettierrc for the prettier config
  - make a .prettierignore for ignoring the files from prettier

#### Making the project restart every-time we make changes and not have to run npm run ...
- we'll use nodemon, which tracks the files for changes and restarts the server automatically
- install nodemon in the project with 'npm install --save-dev nodemon'
- now change the package.json file and make 2 variables inside scripts
  - for 'dev' - 'nodemon index.js' which is for devel mode
  - for 'start' - 'node index.js' when the app is in production mode
- this is also known as hot refresh or hot reloading

#### Hiding our secrets (.env) file
- we install an npm package called 'dotenv'
- When you load the dotenv package, it searches for a .env file in the directory where your application is running, reads the variables from that file, and adds them to process.env so your Node.js application can access them.
- when u install the package, import it into the entry point of the code base
  - with import dotenv from "dotenv"
- then u can make a config change for dotenv with
  - dotenv.config({path: ./.env});
- then use the stuff with 'process.env.varname'

#### Structuring the code-base
- public - this directory lets keep the files that are to be served to the users
- src - 
  - controllers - writing the logics, and the functions
  - db - a place to write the db connections and other db operations
  - middleware - for tasks that are done in between
  - models - stores the structure of the database
  - routes - keeps the routing into
  - utils - to keep the stuff that are reusable
  - validators - to validate the data

## Setting up Express Server and database

- we use express as a routing library
- and here we are using mongoDB as the database.
- express communicates to mongoDB, via a mongoose, an ORM, that is used to communicate to mongoDB

- install express from the site
- import it in the index file
  - from express import "express"
- make a const app = express();
- you'll get access to functions
- also import the port from the .env (PORT)
eg.
```javascript
app.get("/", (req, res) => {
  res.send("Hello World");
});
// get is used to retrieve the data
// the get method takes in 2 parameters
// 1. req - this is the data is the user is asking for
// 2. res - the response that the server is sending back
```
- also u need to make app.listen(port, ()=>{stuff to print in the terminal, maybe a run note})

#### Structuring the code base 2.0
- index.js is suppose to be the main entry point of the codebase
- so writing express code there should not be a valid point
- so make an app.js (in src) and 
  - import express
  - make an express app
  - between these write the express config
  - export default app

## Express config and CORS error
1. CORS {Cross Origin Resource Sharing} error - it is a security restriction enforced by web browsers when a frontend web application running on one origin attempts to request resources from a backend server on a different origin
 - if the backend allows the transaction to be allowed, the frontend recieves the data.
 - if not, browser does not allows the accessing of data
 - hence giving a CORS error

2. Express Config
- we write middleware, which deal with the requests (not directly to the backend)
```javascript
app.use(express.json({ limit: "16kb" }));
// Parses incoming JSON data and stores it in req.body.
// Limits request body size to 16kb.

app.use(express.urlencoded({ extended: true, limit: "16kb" }));
// Parses HTML form data (URL-encoded) and stores it in req.body.
// Supports nested objects when extended is true.

app.use(express.static("public"));
// Serves static files (images, CSS, JS, PDFs, etc.)
// from the public directory.
```
3. CORS config - another middleware, that is used to manange the cors functionalities
```js
// cors config
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
```

#### Purpose
- Controls which frontend applications can access the backend.

- Options
  - origin - Allowed frontend origins.
    - Reads from .env.
    - Supports multiple origins using .split(",").
    - Falls back to http://localhost:5173.
  - credentials: true
    - Allows cookies and authentication credentials.
  - methods
    - Allowed HTTP methods.
  - allowedHeaders (contains the metadata of what stuff )
    - Allowed request headers.
     - Content-Type → JSON/form data.
     - Authorization → JWT/Bearer tokens.
