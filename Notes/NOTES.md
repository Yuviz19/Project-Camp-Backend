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
