import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import http from "http";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import corsOptions from "../src/config/cors";
import ConnectDatabase from "./config/db";
import authRoutes from "./routes/authroutes/authroutes";
import userRoutes from "./routes/usersRoutes/usersRoutes";
import fileUploadRoutes from "./routes/fileupload/fileuploadRoute";
import programRoutes from "./routes/programRoutes/programRoutes";
import trainingReqRouter from "./routes/trainingRequestRoutes/trainingReqRoutes";
import verificationRoutes from "./routes/verificationRoutes/verificationRoutes";

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

const server = http.createServer(app);
const io = new Server(server);

server.listen(port, () => {
  console.log(`Server listening on port: ${port}`);
});
