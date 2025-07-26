import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import http from "http";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import corsOptions from "../src/config/cors";
import authRoutes from "./routes/authroutes/authroutes";
import userRoutes from "./routes/usersRoutes/usersRoutes";
import fileUploadRoutes from "./routes/fileupload/fileuploadRoute";
import programRoutes from "./routes/programRoutes/programRoutes";

// Load env variables
const port = process.env.PORT || 4000;
const app = express();

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

const server = http.createServer(app);
const io = new Server(server);

server.listen(port, () => {
  console.log(`Server listening on port: ${port}`);
});
