import mongoose from "mongoose";

const studentInfoSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    school_id: {
      type: mongoose.Schema.Types.ObjectId, 
      required: true,
    },
    trustee_id: {
      type: mongoose.Schema.Types.ObjectId, 
      required: true,
    },
    student_info: {
      type: studentInfoSchema,
      required: true,
    },
    gateway_name: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Order = mongoose.model("Order", orderSchema);
