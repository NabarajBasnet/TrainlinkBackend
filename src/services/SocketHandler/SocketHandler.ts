import { saveMessage } from "../../controllers/messages/message.contorller";
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

export function SocketHandler(io: any) {
  io.on("connection", (socket: any) => {
    console.log(socket.id);

    // Join a room
    socket.on("join-message-room", (roomId: string) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    // Sending a message
    socket.on("sed-message", async (messageData: messageData) => {
      console.log("Message data: ", messageData);

      // Emit to everyone in that room
      io.to(messageData.roomId).emit("receive-message", messageData);
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
}
