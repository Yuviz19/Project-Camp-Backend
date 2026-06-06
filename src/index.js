import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./db/database.js";

dotenv.config({
  // give the path to the .env file ./ is for root level
  path: "./.env"
});

const port = process.env.PORT || 3000;

// so, start listining on to the port, only when the db is responding
connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`the app is listining on port http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed ", err);
    process.exit(1);
  })
