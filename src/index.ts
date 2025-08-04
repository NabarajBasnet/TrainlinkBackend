import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import http from "http";
import cookieParser from "cookie-parser";
import { Server as SocketIOServer } from "socket.io";
import corsOptions from "../src/config/cors";
import ConnectDatabase from "./config/db";
import authRoutes from "./routes/auth/authroutes";
import userRoutes from "./routes/users/usersRoutes";
import fileUploadRoutes from "./routes/fileupload/fileuploadRoute";
import programRoutes from "./routes/programRoutes/programRoutes";
import trainingReqRouter from "./routes/trainingRequestRoutes/trainingReqRoutes";
import verificationRoutes from "./routes/verificationRoutes/verificationRoutes";
import proposalRoutes from "./routes/proposalRoutes/proposalRoutes";
import enrollmentRoutes from "./routes/enrollmentRoutes/enrollmentRoutes";
import connectionRoutes from "./routes/connections/connections";

// Load env variables
const port = process.env.PORT || 4000;
const app = express();

// Connect to database at startup
ConnectDatabase()
  .then(() => {
    console.log("Database connection established");
  })
  .catch((error) => {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  });

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Routes
// Auth Routes
app.use("/api", authRoutes);

// User Routes
app.use("/api", userRoutes);

// File Upload Routes
app.use("/api", fileUploadRoutes);

// Program Routes
app.use("/api", programRoutes);

// Training Request Routes
app.use("/api", trainingReqRouter);

// Verification Routes
app.use("/api", verificationRoutes);

// Proposals Routes
app.use("/api", proposalRoutes);

// Enrollments Routes
app.use("/api", enrollmentRoutes);

// Connection Routes
app.use("/api", connectionRoutes);

const server = http.createServer(app);

// Socket.IO setup
const io = new SocketIOServer(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Store user socket mappings
const userSockets = new Map<string, string>();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Authenticate user and store mapping
  socket.on("authenticate", (userId: string) => {
    userSockets.set(userId, socket.id);
    socket.join(userId);
    console.log(`User ${userId} authenticated and joined room`);
  });

  socket.on("disconnect", () => {
    // Remove user mapping
    for (const [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(userId);
        break;
      }
    }
    console.log("User disconnected:", socket.id);
  });
});

// Make io available to routes
app.set("io", io);

server.listen(port, () => {
  console.log(`Server listening on port: ${port}`);
});
