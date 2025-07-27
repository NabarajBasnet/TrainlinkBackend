import { Schema, model, Types } from "mongoose";

const TrainingRequestSchema = new Schema(
  {
    memberId: { type: Types.ObjectId, ref: "users", required: true },

    goal: { type: String, required: true },
    description: { type: String, required: true },
    preferredDaysPerWeek: { type: Number, required: true },
    budgetPerWeek: { type: Number, required: true },
    availableTimeSlots: [{ type: String }],

    status: {
      type: String,
      enum: ["Active", "Inactive", "Disabled", "Pending"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

export const TrainingRequest = model("TrainingRequest", TrainingRequestSchema);
