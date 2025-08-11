import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import http from "http";
import cookieParser from "cookie-parser";
import corsOptions from "../src/config/cors";
import ConnectDatabase from "./config/db";

// Routes
import authRoutes from "./routes/auth/authroutes";
import userRoutes from "./routes/users/usersRoutes";
import fileUploadRoutes from "./routes/fileupload/fileuploadRoute";
import programRoutes from "./routes/programRoutes/programRoutes";
import trainingReqRouter from "./routes/trainingRequestRoutes/trainingReqRoutes";
import verificationRoutes from "./routes/verificationRoutes/verificationRoutes";
import proposalRoutes from "./routes/proposalRoutes/proposalRoutes";
import enrollmentRoutes from "./routes/enrollmentRoutes/enrollmentRoutes";
import connectionRoutes from "./routes/connections/connections";
import { SocketInit } from "./config/socket";

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

SocketInit(server);

server.listen(port, () => {
  console.log(`Server listening on port: ${port}`);
});
