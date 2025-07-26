import { Schema, model, Types } from "mongoose";

const ProgramSchema = new Schema(
  {
    trainerId: {
      type: Types.ObjectId,
      ref: "users",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    durationInWeeks: {
      type: Number,
    },
    price: {
      type: Number,
      default: 0,
    },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    maxSlot: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Program = model("Program", ProgramSchema);
