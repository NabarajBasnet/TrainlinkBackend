import { Schema, model, Types } from "mongoose";

const TrainingRequestSchema = new Schema(
  {
    memberId: { type: Types.ObjectId, ref: "users", required: true },

    goal: { type: String, required: true },
    description: { type: String },
    preferredDaysPerWeek: { type: Number },
    availableTimeSlots: [{ type: String }],
    budgetPerWeek: { type: Number },

    status: {
      type: String,
      enum: ["Open", "Matched", "Closed"],
      default: "Open",
    },
  },
  {
    timestamps: true,
  }
);

export const TrainingRequest = model("TrainingRequest", TrainingRequestSchema);
