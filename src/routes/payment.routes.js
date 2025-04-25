import express from "express";
import {
  createPayment,
  checkStatus,
  handleCallback,
} from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/create-payment", createPayment);

router.get("/check-status/:collect_request_id", checkStatus);

router.post("/payment-callback", handleCallback);

export default router;
