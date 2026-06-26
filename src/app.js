import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// basic config (making middleware)
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

// cookie parser
app.use(cookieParser());

// cors config
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Import routes
import healthCheckRouter from "./routes/healthcheck.routes.js";
app.use("/api/v1/healthcheck", healthCheckRouter);

import authRouter from "./routes/auth.routes.js"
app.use("/api/v1/auth", authRouter);

import projectRouter from "./routes/project.routes.js"
app.use("/api/v1/projects", projectRouter);

// basic entry point
app.get("/", (req, res) => {
  res.send("Hello World");
});

export default app;
