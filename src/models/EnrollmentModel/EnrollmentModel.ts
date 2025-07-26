import { Schema, model, Types } from "mongoose";

const EnrollmentSchema = new Schema({
  programId: {
    type: Types.ObjectId,
    ref: "Program",
    required: true,
  },
  memberId: {
    type: Types.ObjectId,
    ref: "users",
    required: true,
  },
  joinedDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["Ongoing", "Completed", "Cancelled"],
    default: "Ongoing",
  },
  progressNotes: [
    {
      date: Date,
      note: String,
    },
  ],
  updatedAt: { type: Date, default: Date.now },
});

EnrollmentSchema.index({ programId: 1, memberId: 1 }, { unique: true });

export const Enrollment = model("Enrollment", EnrollmentSchema);
