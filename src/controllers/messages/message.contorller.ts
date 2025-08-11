import ConnectDatabase from "../../config/db";
import MessageModel from "../../models/Chats/Chats";
import mongoose from "mongoose";

interface messageData {
  roomId: string;
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  message: string;
  read: boolean;
  attachments?: string[];
  sentAt?: Date;
}

export const saveMessage = async (data: messageData) => {
  try {
    // Get id from token

    await ConnectDatabase();
    const { roomId, receiverId, message, read, sentAt } = data;

    // const saved = await MessageModel.create({
    //     senderId:
    // });
    // return saved;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    console.log("Error: ", error);
  }
};
