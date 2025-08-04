import mongoose, { Schema, Document } from "mongoose";

export interface IConnection extends Document {
  clientId: mongoose.Types.ObjectId;
  trainerId: mongoose.Types.ObjectId;
  source: "Proposal" | "Enrollment";
  status: "Active" | "Completed" | "Blocked";
  chatEnabled: boolean;
  blockedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  lastEngagementAt?: Date;
  endedAt?: Date;
}

const ConnectionSchema: Schema<IConnection> = new Schema(
  {
    clientId: { type: Schema.Types.ObjectId, ref: "users", required: true },
    trainerId: { type: Schema.Types.ObjectId, ref: "users", required: true },
    source: { type: String, enum: ["Proposal", "Enrollment"], required: true },
    status: {
      type: String,
      enum: ["Active", "Completed", "Blocked"],
      default: "Active",
    },
    chatEnabled: { type: Boolean, default: true },
    blockedBy: { type: Schema.Types.ObjectId, ref: "users" },
    lastEngagementAt: { type: Date },
    endedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IConnection>("Connection", ConnectionSchema);
