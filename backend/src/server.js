import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import app from "./app.js";
import pool from "./config/db.js";
import { initializeSocket } from "./socket/socket.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  },
});

// Attach io to app
app.set("io", io);

// Initialize socket handlers
initializeSocket(io);

// Test database connection
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
  } else {
    console.log("✅ Database connected at:", res.rows[0].now);
  }
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 FleetFlow API running on port ${PORT}`);
  console.log(`📡 Socket.io ready for connections`);
  console.log(`🌐 CORS enabled for: ${process.env.CLIENT_URL}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, closing server...");
  httpServer.close(() => {
    pool.end();
    console.log("Server closed");
    process.exit(0);
  });
});
