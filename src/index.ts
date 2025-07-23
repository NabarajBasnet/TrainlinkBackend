import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

// Load env variables
dotenv.config();
const port = process.env.PORT || 4000;

// Initialize app and server
const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

const io = new Server(server);
