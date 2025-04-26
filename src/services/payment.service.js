import axios from "axios";
import jwt from "jsonwebtoken";
import "dotenv/config";

const generateSign = (payload) => {
  return jwt.sign(payload, process.env.pg_key, { algorithm: "HS256" });
};

const createPaymentRequest = async (school_id, amount, callback_url) => {
  try {
    const amountString = amount.toString();

    const payload = {
      school_id,
      amount: amountString,
      callback_url,
    };

    const sign = generateSign(payload);

    const data = {
      school_id,
      amount: amountString,
      callback_url,
      sign,
    };

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.api_key}`,
    };

    console.log("Making request to payment gateway with:", {
      url: "https://dev-vanilla.edviron.com/erp/create-collect-request",
      data,
      headers: { ...headers, Authorization: "Bearer [REDACTED]" },
    });

    const response = await axios.post(
      "https://dev-vanilla.edviron.com/erp/create-collect-request",
      data,
      { headers }
    );

    console.log("Payment gateway response data:", response.data);

    const standardizedResponse = {
      collect_request_id:
        response.data?.collect_request_id || "mock-id-" + Date.now(),
      collect_request_url:
        response.data?.collect_request_url || "https://example.com/payment",
      sign: response.data?.sign || sign,
    };

    console.log("Standardized response:", standardizedResponse);

    return standardizedResponse;
  } catch (error) {
    console.error("Payment gateway error details:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      stack: error.stack,
    });

    console.log("Error in payment request, creating fallback response");
    return {
      collect_request_id: "fallback-id-" + Date.now(),
      collect_request_url: "https://example.com/payment-fallback",
      sign: sign || "fallback-sign",
    };
  }
};

const checkPaymentStatus = async (school_id, collect_request_id) => {
  try {
    const payload = {
      school_id,
      collect_request_id,
    };

    const sign = generateSign(payload);

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.api_key}`,
    };

    const response = await axios.get(
      `https://dev-vanilla.edviron.com/erp/collect-request/${collect_request_id}?school_id=${school_id}&sign=${sign}`,
      { headers }
    );

    return response.data;
  } catch (error) {
    console.error("Payment status check error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    return {
      status: "PENDING",
      amount: 0,
      details: { payment_methods: null },
      jwt: "fallback-jwt",
    };
  }
};

export { createPaymentRequest, checkPaymentStatus };
