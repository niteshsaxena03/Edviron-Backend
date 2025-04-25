import {
  createPaymentRequest,
  checkPaymentStatus,
} from "../services/payment.service.js";
import { Order } from "../models/order.model.js";
import { OrderStatus } from "../models/orderStatus.model.js";
import { Webhook } from "../models/webhook.model.js";
import ApiResponse from "../utils/ApiResponse.utils.js";
import asyncHandler from "../utils/AsyncHandler.utils.js";
import ApiError from "../utils/ApiError.utils.js";
import mongoose from "mongoose";

// Create Payment Controller
const createPayment = asyncHandler(async (req, res) => {
  console.log("Payment request received:", req.body);
  const {
    school_id,
    amount,
    callback_url,
    student_info,
    trustee_id,
    gateway_name = "Edviron",
  } = req.body;

  // Validate if the required fields are provided
  if (!school_id || !amount || !callback_url) {
    console.log("Missing required fields");
    return res
      .status(400)
      .json(
        new ApiResponse(
          400,
          "Missing required fields: school_id, amount, or callback_url",
          null
        )
      );
  }

  try {
    // Create an order in the database
    const order = new Order({
      school_id,
      trustee_id: trustee_id || "65b0e552dd31950a9b41c5ba", // Default from the instructions
      student_info: student_info || {
        name: "Student",
        id: "STD" + Date.now(),
        email: "student@example.com",
      },
      gateway_name: gateway_name,
    });

    // Save the order
    const savedOrder = await order.save();
    console.log("Order created:", savedOrder._id);

    // Call service function to create payment request
    const paymentResponse = await createPaymentRequest(
      school_id,
      amount,
      callback_url
    );

    console.log("Payment gateway response in controller:", paymentResponse);

    // Create an order status entry
    const orderStatus = new OrderStatus({
      collect_id: savedOrder._id,
      order_amount: amount,
      transaction_amount: amount, // Same as order amount initially
      payment_mode: "Not initiated",
      status: "NOT INITIATED",
      payment_time: new Date(),
    });

    // Save the order status
    const savedOrderStatus = await orderStatus.save();
    console.log("Order status created:", savedOrderStatus._id);

    // Option 1: Redirect the user directly to the payment page
    if (req.query.redirect === "true" && paymentResponse.collect_request_url) {
      console.log("Redirecting to:", paymentResponse.collect_request_url);
      return res.redirect(paymentResponse.collect_request_url);
    }

    // Option 2: Return the payment data as JSON
    console.log("Sending JSON response");
    return res.status(200).json(
      new ApiResponse(200, "Payment request created successfully", {
        ...paymentResponse,
        order_id: savedOrder._id,
        order_status_id: savedOrderStatus._id,
      })
    );
  } catch (error) {
    console.error("Error creating payment:", error);
    return res
      .status(500)
      .json(
        new ApiResponse(500, "Error creating payment: " + error.message, null)
      );
  }
});

// Check Payment Status Controller
const checkStatus = asyncHandler(async (req, res) => {
  const { collect_request_id } = req.params;
  const { school_id } = req.query;

  // Validate if the required fields are provided
  if (!collect_request_id || !school_id) {
    return res
      .status(400)
      .json(
        new ApiResponse(
          400,
          "Missing required fields: collect_request_id or school_id",
          null
        )
      );
  }

  try {
    // Call service function to check payment status
    const paymentStatus = await checkPaymentStatus(
      school_id,
      collect_request_id
    );

    // Try to find the order status in the database
    // Check if collect_request_id is a valid MongoDB ObjectId
    let orderStatus = null;
    if (mongoose.Types.ObjectId.isValid(collect_request_id)) {
      orderStatus = await OrderStatus.findOne({
        collect_id: collect_request_id,
      }).populate({
        path: "collect_id",
        model: "Order",
      });
    }

    // Combine payment gateway status with database status
    const statusResponse = {
      gateway_status: paymentStatus,
      db_status: orderStatus,
    };

    // Send successful response with status data
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Payment status fetched successfully",
          statusResponse
        )
      );
  } catch (error) {
    console.error("Error checking payment status:", error);
    return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          "Error checking payment status: " + error.message,
          null
        )
      );
  }
});

// Handle Callback Controller (Webhook)
const handleCallback = asyncHandler(async (req, res) => {
  const { payment_status, collect_request_id, payment_details } = req.body;

  // Validate the required callback data
  if (!payment_status || !collect_request_id) {
    return res
      .status(400)
      .json(new ApiResponse(400, "Missing required callback data", null));
  }

  try {
    // Log webhook event
    const webhook = new Webhook({
      event_type: "payment_callback",
      payload: req.body,
      status: "success",
      source: "payment_gateway",
      processed_at: new Date(),
    });
    await webhook.save();

    // Try to find the order status in the database
    let orderStatus = null;
    if (mongoose.Types.ObjectId.isValid(collect_request_id)) {
      orderStatus = await OrderStatus.findOne({
        collect_id: collect_request_id,
      });

      if (orderStatus) {
        // Update the order status
        orderStatus.status = payment_status;
        orderStatus.payment_details = payment_details || "No details provided";
        orderStatus.payment_time = new Date();

        if (payment_status === "SUCCESS") {
          orderStatus.bank_reference = req.body.bank_reference || "N/A";
          orderStatus.payment_mode = req.body.payment_mode || "Unknown";
          orderStatus.payment_message = "Payment successful";
        } else {
          orderStatus.error_message =
            req.body.error_message || "Payment failed";
        }

        await orderStatus.save();
        console.log(
          `Payment status updated for collect_request_id: ${collect_request_id}`
        );
      } else {
        console.log(
          `OrderStatus not found for collect_request_id: ${collect_request_id}`
        );
      }
    }

    // Handle the callback response based on payment status
    if (payment_status === "SUCCESS") {
      console.log(
        `Payment successful for collect_request_id: ${collect_request_id}`
      );
    } else {
      console.log(
        `Payment failed for collect_request_id: ${collect_request_id}`
      );
    }

    // Send success response to acknowledge callback receipt
    return res.status(200).json(
      new ApiResponse(200, "Payment status received successfully", {
        updated: !!orderStatus,
      })
    );
  } catch (error) {
    console.error("Error processing payment callback:", error);

    // Log webhook error
    try {
      const webhook = new Webhook({
        event_type: "payment_callback",
        payload: req.body,
        status: "failed",
        error: error.message,
        source: "payment_gateway",
        processed_at: new Date(),
      });
      await webhook.save();
    } catch (logError) {
      console.error("Error logging webhook error:", logError);
    }

    return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          "Error processing payment callback, but acknowledged",
          null
        )
      );
  }
});

export { createPayment, checkStatus, handleCallback };
