import mongoose from "mongoose";

const webhookSchema = new mongoose.Schema(
  {
    event_type: {
      type: String,
      required: true,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    status: {
      type: String,
      enum: ["success", "failed", "pending"],
      required: true,
    },
    response: {
      type: mongoose.Schema.Types.Mixed,
    },
    error: {
      type: String,
    },
    source: {
      type: String,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    processed_at: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const Webhook = mongoose.model("Webhook", webhookSchema);
