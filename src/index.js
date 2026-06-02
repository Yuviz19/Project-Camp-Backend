import dotenv from "dotenv";
import express from "express";

dotenv.config({
  // give the path to the .env file ./ is for root level
  path: "./.env"
});

const app = express();
const port = process.env.PORT || 3000;

// get is used to get the data and store it to the database
// the get method takes in 2 parameters
// 1. req - this is the data is the user is asking for
// 2. res - the response that the server is sending back
app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(port, () => {
  console.log(`the app is listining on port http://localhost:${port}`);
});
