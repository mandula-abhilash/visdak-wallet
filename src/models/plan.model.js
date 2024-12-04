import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["one-time", "subscription", "wallet-recharge"],
      required: true,
    },
    tokens: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
    },
    validityPeriod: {
      type: Number,
    },
    region: {
      type: String,
      required: true,
      index: true,
    },
    currency: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

planSchema.index({ type: 1, region: 1, isActive: 1 });

export const PlanModel = mongoose.model("Plan", planSchema);
