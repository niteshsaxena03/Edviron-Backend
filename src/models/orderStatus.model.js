import mongoose from "mongoose";

const orderStatusSchema = new mongoose.Schema(
  {
    collect_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    order_amount: {
      type: Number,
      required: true,
    },
    transaction_amount: {
      type: Number,
      required: true,
    },
    payment_mode: {
      type: String,
      required: true,
    },
    payment_details: {
      type: String,
    },
    bank_reference: {
      type: String,
    },
    payment_message: {
      type: String,
    },
    status: {
      type: String,
      required: true,
    },
    error_message: {
      type: String,
    },
    payment_time: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const OrderStatus = mongoose.model("OrderStatus", orderStatusSchema);
