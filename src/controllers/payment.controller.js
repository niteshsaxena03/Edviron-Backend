import {
  createPaymentRequest,
  checkPaymentStatus,
} from "../services/payment.service.js";
import ApiResponse from "../utils/ApiResponse.utils.js";
import asyncHandler from "../utils/AsyncHandler.utils.js";
import ApiError from "../utils/ApiError.utils.js";

// Create Payment Controller
const createPayment = asyncHandler(async (req, res) => {
  console.log("Payment request received:", req.body);
  const { school_id, amount, callback_url } = req.body;

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

  // Call service function to create payment request
  const paymentResponse = await createPaymentRequest(
    school_id,
    amount,
    callback_url
  );

  console.log("Payment gateway response in controller:", paymentResponse);

  // Option 1: Redirect the user directly to the payment page
  if (req.query.redirect === "true" && paymentResponse.collect_request_url) {
    console.log("Redirecting to:", paymentResponse.collect_request_url);
    return res.redirect(paymentResponse.collect_request_url);
  }

  // Option 2: Return the payment data as JSON
  console.log("Sending JSON response");
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Payment request created successfully",
        paymentResponse
      )
    );
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

  // Call service function to check payment status
  const status = await checkPaymentStatus(school_id, collect_request_id);

  // Send successful response with status data
  return res
    .status(200)
    .json(new ApiResponse(200, "Payment status fetched successfully", status));
});

// Handle Callback Controller
const handleCallback = asyncHandler(async (req, res) => {
  const { payment_status, collect_request_id } = req.body;

  // Validate the required callback data
  if (!payment_status || !collect_request_id) {
    return res
      .status(400)
      .json(new ApiResponse(400, "Missing required callback data", null));
  }

  // Handle the callback response: Update payment status in your database
  if (payment_status === "SUCCESS") {
    // Log payment successful or update payment as successful in DB
    console.log(
      `Payment successful for collect_request_id: ${collect_request_id}`
    );
    // Insert database update logic here
  } else {
    // Handle failure or other statuses
    console.log(`Payment failed for collect_request_id: ${collect_request_id}`);
  }

  // Send success response to acknowledge callback receipt
  return res
    .status(200)
    .json(new ApiResponse(200, "Payment status received successfully", null));
});

export { createPayment, checkStatus, handleCallback };
