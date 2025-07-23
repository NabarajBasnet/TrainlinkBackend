import express from "express";
import cors from "cors";
import http from "http";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import corsOptions from "../src/config/cors";
import authRoutes from "./routes/authroutes/authroutes";
import userRoutes from "./routes/usersRoutes/usersRoutes";
import dotenv from "dotenv";

// Load env variables
dotenv.config();
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

const server = http.createServer(app);
const io = new Server(server);

server.listen(port, () => {
  console.log(`Server listening on port: ${port}`);
});
