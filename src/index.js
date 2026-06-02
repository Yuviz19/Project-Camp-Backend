import dotenv from "dotenv";

dotenv.config({
  // give the path to the .env file ./ is for root level
  path: "./.env"
})

const username = process.env.myusername;

console.log(`hello ${username}`);
