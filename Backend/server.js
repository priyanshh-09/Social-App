// this is the entry point of our backend


// const express = require("express");
import jwt from "jsonwebtoken";
import { initializeSocket } from "./Utils/socket.js";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import mongoose from "mongoose";
import errorMiddleware from "./Middleware/errorMiddleware.js";
import postRoutes from "./Routes/postRoutes.js";
import authRoutes from "./Routes/authRoutes.js";
import commentRoutes from "./Routes/commentsRoutes.js";
import userRoutes from "./Routes/userRoutes.js";
import notificationRoutes from "./Routes/notificationRoutes.js";
import dotenv from "dotenv";

dotenv.config(); 

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});
initializeSocket(io);

io.use((socket, next) => {
  try {
    const cookieHeader = socket.handshake.headers.cookie || "";

    const tokenCookie = cookieHeader
      .split(";")
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith("token="));

    if (!tokenCookie) {
      return next(new Error("Authentication required"));
    }

    const token = tokenCookie.slice("token=".length);

    const decoded = jwt.verify(
      decodeURIComponent(token),
      process.env.JWT_SECRET,
    );

    if (!decoded.userId) {
      return next(new Error("User ID missing from token"));
    }

    socket.userId = decoded.userId;
    next();
  } catch (error) {
    console.error("Socket authentication detail:", error.message);
    next(new Error("Socket authentication failed"));
  }
});

io.on("connection", (socket) => {
    socket.join(`user:${socket.userId}`);

    console.log("Authenticated user connected:", socket.userId);

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.userId);
    });
});

app.use(cors({
  origin:"http://localhost:5173",
  credentials:true
}))

app.use(express.json());
app.use(cookieParser());

// console.log(app);


//routes

  app.use("/api/posts", postRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/posts", commentRoutes);
  app.use("/api", userRoutes);
  app.use("/api/notifications", notificationRoutes)

  app.use(errorMiddleware)


//db connection

mongoose
.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((error) => {
    console.log("MongoDB connection failed:", error);
  });


httpServer.listen(5000, () => {
  console.log("Server is Running on port 5000");
});


