import express from "express";
import {
  getAllTransactions,
  getTransactionsBySchool,
  getTransactionStatus,
} from "../controllers/transaction.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Route to get all transactions with pagination, sorting, and filtering
// Protected route - requires authentication
router.get("/", protect, getAllTransactions);

// Route to get transactions by school
// Protected route - requires authentication
router.get("/school/:schoolId", protect, getTransactionsBySchool);

// Route to check transaction status
// Protected route - requires authentication
router.get("/status/:custom_order_id", protect, getTransactionStatus);

export default router;
