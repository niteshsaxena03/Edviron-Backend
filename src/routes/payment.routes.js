import express from "express";
import {
  createPayment,
  checkStatus,
  handleCallback,
} from "../controllers/payment.controller.js";

const router = express.Router();

// Route to create a payment request
router.post("/create-payment", createPayment);

// Route to check payment status
router.get("/check-status/:collect_request_id", checkStatus);

// Route to handle callback from the payment gateway
// This route will be called by the payment gateway after the payment is completed
router.post("/payment-callback", handleCallback);

export default router;
