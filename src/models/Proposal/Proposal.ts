import mongoose, { Schema, Document } from "mongoose";

export interface IProposal extends Document {
  trainerId: mongoose.Types.ObjectId;
  memberId: mongoose.Types.ObjectId;
  planId: mongoose.Types.ObjectId;
  message: string;
  status: "Pending" | "Accepted" | "Rejected" | "Cancelled";
  cancellationReason?: String;
  createdAt: Date;
  updatedAt: Date;
}

const ProposalSchema = new Schema<IProposal>(
  {
    trainerId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    memberId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    planId: {
      type: Schema.Types.ObjectId,
      ref: "TrainingRequest",
      required: true,
    },
    message: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected", "Cancelled"],
      default: "Pending",
    },
    cancellationReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
ProposalSchema.index({ trainerId: 1, status: 1 });
ProposalSchema.index({ memberId: 1, status: 1 });
ProposalSchema.index({ planId: 1 });

export const Proposal = mongoose.model<IProposal>("Proposal", ProposalSchema);
