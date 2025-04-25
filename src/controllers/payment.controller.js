import {
  createPaymentRequest,
  checkPaymentStatus,
} from "../services/payment.service.js";
import ApiResponse from "../utils/ApiResponse.utils.js";
import asyncHandler from "../utils/AsyncHandler.utils.js"; 
import ApiError from "../utils/ApiError.utils.js"; 

const createPayment = asyncHandler(async (req, res, next) => {
  const { school_id, amount, callback_url } = req.body;

  try {
    const { collect_request_id, Collect_request_url, sign } =
      await createPaymentRequest(school_id, amount, callback_url);

    const response = new ApiResponse(
      200,
      "Payment request created successfully",
      { collect_request_url: Collect_request_url, sign }
    );
    res.status(200).json(response);
  } catch (error) {
    next(new ApiError(500, error.message || "Error creating payment request"));
  }
});

const checkStatus = asyncHandler(async (req, res, next) => {
  const { collect_request_id } = req.params;
  const { school_id, sign } = req.query;

  try {
    const status = await checkPaymentStatus(
      school_id,
      collect_request_id,
      sign
    );

    const response = new ApiResponse(
      200,
      "Payment status retrieved successfully",
      status
    );
    res.status(200).json(response);
  } catch (error) {
    next(new ApiError(500, error.message || "Error checking payment status"));
  }
});

export { createPayment, checkStatus };
