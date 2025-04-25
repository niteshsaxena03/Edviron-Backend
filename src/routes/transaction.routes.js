import express from "express";
import {
  getAllTransactions,
  getTransactionsBySchool,
  getTransactionStatus,
} from "../controllers/transaction.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();


router.get("/", protect, getAllTransactions);

router.get("/school/:schoolId", protect, getTransactionsBySchool);

router.get("/status/:custom_order_id", protect, getTransactionStatus);

export default router;
