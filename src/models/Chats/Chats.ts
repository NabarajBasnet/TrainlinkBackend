import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  connectionId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  message: string;
  read: boolean;
  attachments?: string[];
  sentAt: Date;
}

const MessageSchema: Schema<IMessage> = new Schema(
  {
    connectionId: {
      type: Schema.Types.ObjectId,
      ref: "Connection",
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    attachments: [
      {
        type: String,
      },
    ],
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IMessage>("Message", MessageSchema);
