import express, { urlencoded } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/user.routes.js"; // Import the user routes

dotenv.config({
  path: "./src/.env",
});

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST", "DELETE"],
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.static("public"));
app.use(urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

app.use("/api/users", userRoutes);

export { app };
