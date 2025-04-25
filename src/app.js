import express, { urlencoded } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";

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


export { app };
