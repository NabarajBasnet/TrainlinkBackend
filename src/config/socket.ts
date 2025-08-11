import { Server } from "socket.io";
import { SocketHandler } from "../services/SocketHandler/SocketHandler";

let ioInstance: any = null;

export async function SocketInit(server: any) {
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:3000"],
      methods: ["GET", "POST"],
    },
  });
  ioInstance = io;
  SocketHandler(io);
}

export function getIo() {
  if (!ioInstance) {
    throw new Error("Socket.io not initialized");
  }
  return ioInstance;
}
