# Validation
- This is the process where we need to validate the data
  - that is being sent in by the user before using it

- some libraries that are used are 
1. Zod
2. yup
3. express-validator
- their sole purpose it to validate the data, give proper errors.. etc

## Writing Middleware
- middleware are functions that executes sequentially during the request, response cycle
- it acts as a pipeline or checkpoint, sitting directly between incoming raw client and route handler

## Application
- writing a middleware
- writing validators for incoming data
- and implementing them in the routes

### Writing Middleware
