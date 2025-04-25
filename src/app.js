import express, { urlencoded } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/user.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";

dotenv.config({
  path: "./src/.env",
});

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.static("public"));
app.use(urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

app.use("/api/users", userRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/transactions", transactionRoutes);

export { app };
