import mongoose, { mongo } from "mongoose";

const ConnectionSchema = new mongoose.Schema(
  {
    trainerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TrainingRequest",
      required: true,
    },
    proposalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Proposal",
      required: true,
    },
    status: {
      type: String,
      enum: ["Active", "Paused", "Completed", "Cancelled"],
      default: "Active",
    },
    startedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export const Connection =
  mongoose.models.connection || mongoose.model("connection", ConnectionSchema);
