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
// get is used to get the data and store it to the database
// the get method takes in 2 parameters
// 1. req - this is the data is the user is asking for
// 2. res - the response that the server is sending back
```
- also u need to make app.listen(port, ()=>{stuff to print in the terminal, maybe a run note})
