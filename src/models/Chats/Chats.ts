import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  roomId: string;
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  message: string;
  read: boolean;
  attachments?: string[];
  sentAt: Date;
}

const MessageSchema: Schema<IMessage> = new Schema(
  {
    roomId: {
      type: String,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "users",
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
