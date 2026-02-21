export const initializeSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("✅ Client connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });

    // Custom events can be added here
    socket.on("ping", () => {
      socket.emit("pong");
    });
  });

  return io;
};
