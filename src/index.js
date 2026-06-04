import dotenv from "dotenv";
import app from "./app.js";

dotenv.config({
  // give the path to the .env file ./ is for root level
  path: "./.env"
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`the app is listining on port http://localhost:${port}`);
});
