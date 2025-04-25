import { Order } from "../models/order.model.js";
import { OrderStatus } from "../models/orderStatus.model.js";
import ApiResponse from "../utils/ApiResponse.utils.js";
import ApiError from "../utils/ApiError.utils.js";
import asyncHandler from "../utils/AsyncHandler.utils.js";
import mongoose from "mongoose";

const getAllTransactions = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const sortField = req.query.sort || "createdAt";
    const sortOrder = req.query.order === "asc" ? 1 : -1;
    const sortOptions = {};
    sortOptions[sortField] = sortOrder;

    const statusFilter = req.query.status
      ? { "orderStatus.status": req.query.status }
      : {};

    let dateFilter = {};
    if (req.query.startDate && req.query.endDate) {
      dateFilter = {
        "orderStatus.payment_time": {
          $gte: new Date(req.query.startDate),
          $lte: new Date(req.query.endDate),
        },
      };
    }

    const filter = {
      ...statusFilter,
      ...dateFilter,
    };

    // Use MongoDB aggregation pipeline to join Order and OrderStatus collections
    const transactions = await Order.aggregate([
      {
        $lookup: {
          from: "orderstatuses", 
          localField: "_id",
          foreignField: "collect_id",
          as: "orderStatus",
        },
      },
      {
        $unwind: {
          path: "$orderStatus",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: filter,
      },
      {
        $sort: sortOptions,
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
      {
        $project: {
          collect_id: "$_id",
          school_id: 1,
          gateway: "$gateway_name",
          order_amount: "$orderStatus.order_amount",
          transaction_amount: "$orderStatus.transaction_amount",
          status: "$orderStatus.status",
          custom_order_id: { $ifNull: ["$custom_order_id", "$_id"] },
          payment_time: "$orderStatus.payment_time",
          payment_mode: "$orderStatus.payment_mode",
          payment_details: "$orderStatus.payment_details",
          student_info: 1,
        },
      },
    ]);

    const totalTransactions = await Order.countDocuments();
    const totalPages = Math.ceil(totalTransactions / limit);

    return res.status(200).json(
      new ApiResponse(200, "Transactions fetched successfully", {
        transactions,
        pagination: {
          total: totalTransactions,
          page,
          limit,
          totalPages,
        },
      })
    );
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          "Error fetching transactions: " + error.message,
          null
        )
      );
  }
});

const getTransactionsBySchool = asyncHandler(async (req, res) => {
  try {
    const { schoolId } = req.params;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const sortField = req.query.sort || "createdAt";
    const sortOrder = req.query.order === "asc" ? 1 : -1;
    const sortOptions = {};
    sortOptions[sortField] = sortOrder;

    // Use MongoDB aggregation pipeline to join Order and OrderStatus collections
    const transactions = await Order.aggregate([
      {
        $match: { school_id: schoolId },
      },
      {
        $lookup: {
          from: "orderstatuses",
          localField: "_id",
          foreignField: "collect_id",
          as: "orderStatus",
        },
      },
      {
        $unwind: {
          path: "$orderStatus",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: sortOptions,
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
      {
        $project: {
          collect_id: "$_id",
          school_id: 1,
          gateway: "$gateway_name",
          order_amount: "$orderStatus.order_amount",
          transaction_amount: "$orderStatus.transaction_amount",
          status: "$orderStatus.status",
          custom_order_id: { $ifNull: ["$custom_order_id", "$_id"] },
          payment_time: "$orderStatus.payment_time",
          payment_mode: "$orderStatus.payment_mode",
          payment_details: "$orderStatus.payment_details",
          student_info: 1,
        },
      },
    ]);

    const totalTransactions = await Order.countDocuments({
      school_id: schoolId,
    });
    const totalPages = Math.ceil(totalTransactions / limit);

    if (transactions.length === 0) {
      return res.status(200).json(
        new ApiResponse(200, "No transactions found for this school", {
          transactions: [],
          pagination: {
            total: 0,
            page,
            limit,
            totalPages: 0,
          },
        })
      );
    }

    return res.status(200).json(
      new ApiResponse(200, "Transactions fetched successfully", {
        transactions,
        pagination: {
          total: totalTransactions,
          page,
          limit,
          totalPages,
        },
      })
    );
  } catch (error) {
    console.error("Error fetching school transactions:", error);
    return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          "Error fetching transactions: " + error.message,
          null
        )
      );
  }
});

const getTransactionStatus = asyncHandler(async (req, res) => {
  try {
    const { custom_order_id } = req.params;

    const isValidObjectId = mongoose.Types.ObjectId.isValid(custom_order_id);

    let order;
    if (isValidObjectId) {
      order = await Order.findOne({
        $or: [{ _id: custom_order_id }, { custom_order_id: custom_order_id }],
      });
    } else {
      order = await Order.findOne({ custom_order_id: custom_order_id });
    }

    if (!order) {
      return res
        .status(404)
        .json(new ApiResponse(404, "Transaction not found", null));
    }

    const orderStatus = await OrderStatus.findOne({ collect_id: order._id });

    if (!orderStatus) {
      return res.status(200).json(
        new ApiResponse(200, "Transaction found but status not available", {
          order_id: order._id,
          custom_order_id: order.custom_order_id || order._id,
          status: "NOT FOUND",
          school_id: order.school_id,
          gateway: order.gateway_name,
        })
      );
    }

    return res.status(200).json(
      new ApiResponse(200, "Transaction status fetched successfully", {
        order_id: order._id,
        custom_order_id: order.custom_order_id || order._id,
        status: orderStatus.status,
        order_amount: orderStatus.order_amount,
        transaction_amount: orderStatus.transaction_amount,
        payment_mode: orderStatus.payment_mode,
        payment_details: orderStatus.payment_details,
        payment_time: orderStatus.payment_time,
        gateway: order.gateway_name,
        school_id: order.school_id,
        student_info: order.student_info,
      })
    );
  } catch (error) {
    console.error("Error fetching transaction status:", error);
    return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          "Error fetching transaction status: " + error.message,
          null
        )
      );
  }
});

export { getAllTransactions, getTransactionsBySchool, getTransactionStatus };
