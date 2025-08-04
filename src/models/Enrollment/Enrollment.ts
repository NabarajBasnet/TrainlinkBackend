import mongoose, { Schema, Document } from "mongoose";

export interface IEnrollment extends Document {
  trainerId: mongoose.Types.ObjectId;
  memberId: mongoose.Types.ObjectId;
  planId: mongoose.Types.ObjectId;
  proposalId: mongoose.Types.ObjectId;
  status: "Active" | "Completed" | "Cancelled";
  startDate: Date;
  endDate?: Date;
  progress: {
    completedSessions: number;
    totalSessions: number;
    lastSessionDate?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const EnrollmentSchema = new Schema<IEnrollment>(
  {
    trainerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    memberId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    planId: {
      type: Schema.Types.ObjectId,
      ref: "Program",
      required: true,
    },
    // proposalId: {
    //   type: Schema.Types.ObjectId,
    //   ref: "Proposal",
    //   required: true,
    // },
    status: {
      type: String,
      enum: ["Active", "Completed", "Cancelled"],
      default: "Active",
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    progress: {
      completedSessions: {
        type: Number,
        default: 0,
      },
      totalSessions: {
        type: Number,
        default: 0,
      },
      lastSessionDate: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
EnrollmentSchema.index({ trainerId: 1, status: 1 });
EnrollmentSchema.index({ memberId: 1, status: 1 });
EnrollmentSchema.index({ proposalId: 1 }, { unique: true });

export const Enrollment = mongoose.model<IEnrollment>(
  "Enrollment",
  EnrollmentSchema
);
