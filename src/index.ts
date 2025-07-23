import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import corsOptions from "../src/config/cors";
import authRoutes from "./routes/authroutes/authroutes";

// Load env variables
dotenv.config();
const port = process.env.PORT || 4000;
const app = express();

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Routes
// Auth Routes
app.use("/api", authRoutes);

const server = http.createServer(app);
const io = new Server(server);

server.listen(port, () => {
  console.log(`Server listening on port: ${port}`);
});
