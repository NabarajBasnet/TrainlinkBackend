export function SocketHandler(io: any) {
  io.on("connection", (socket: any) => {
    console.log(socket.id);

    socket.on("send-user-message", (messageData: any) => {
      const { receiverId, message, read, sentAt } = messageData;
      console.log(receiverId, message, read, sentAt);
    });
  });
}
