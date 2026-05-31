# NOTES
- since it is a NODE project

## Steps to initialize a Project
1. Make a PRD (Project Requirement Doc)
2. Setup a project
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

3. making the project restart everytime we make changes and not have to run npm run ...
- we'll use nodemon, which tracks the files for changes and restarts the server automaitically
- install nodemon in the project with 'npm install --save-dev nodemon'
- now change the package.json file and make 2 variables inside scripts
  - for 'dev' - 'nodemon index.js' which is for devel mode
  - for 'start' - 'node index.js' when the app is in production mode
- this is also known as hot refresh or hot relaoding

4. Hiding our secrets (.env) file
- we install an npm package called 'dotenv'
- When you load the dotenv package, it searches for a .env file in the directory where your application is running, reads the variables from that file, and adds them to process.env so your Node.js application can access them.
- when u install the package, import it into the entry point of the code base
  - with import dotenv from "dotenv"
- then u can make a config change for dotenv with
  - dotenv.config({path: ./.env});
- then use the stuff with 'process.env.varname'
