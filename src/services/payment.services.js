import axios from "axios";
import jwt from "jsonwebtoken";
import "dotenv/config";
import ApiError from "../utils/ApiError.utils.js"; 
import ApiResponse from "../utils/ApiResponse.utils.js"; 
import asyncHandler from "../utils/AsyncHandler.utils.js";

// Helper function to generate JWT sign
const generateSign = (payload) => {
  return jwt.sign(payload, process.env.pg_key);
};

const createPaymentRequest = asyncHandler(
  async (school_id, amount, callback_url) => {
    const payload = { school_id, amount, callback_url };
    const sign = generateSign(payload);

    const data = {
      school_id,
      amount,
      callback_url,
      sign,
    };

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.api_key}`,
    };

    try {
      const response = await axios.post(
        "https://dev-vanilla.edviron.com/erp/create-collect-request",
        data,
        { headers }
      );

      // Return structured response
      return new ApiResponse(
        201,
        "Payment request created successfully",
        response.data
      );
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      throw new ApiError(
        500,
        `Error creating payment request: ${errorMessage}`
      );
    }
  }
);

const checkPaymentStatus = asyncHandler(
  async (school_id, collect_request_id, sign) => {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.api_key}`,
    };

    try {
      const response = await axios.get(
        `https://dev-vanilla.edviron.com/erp/collect-request/${collect_request_id}?school_id=${school_id}&sign=${sign}`,
        { headers }
      );

      return new ApiResponse(
        200,
        "Payment status fetched successfully",
        response.data
      );
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;

      throw new ApiError(500, `Error checking payment status: ${errorMessage}`);
    }
  }
);

export { createPaymentRequest, checkPaymentStatus };
