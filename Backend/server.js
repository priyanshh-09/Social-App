// this is the entry point of our backend



// const express = require("express");

import express from "express";
import mongoose from "mongoose";
import postRoutes from "./Routes/postRoutes.js";
import authRoutes from "./Routes/authRoutes.js";
import commentRoutes from "./Routes/commentsRoutes.js";
import userRoutes from "./Routes/userRoutes.js";
import dotenv from "dotenv";

dotenv.config(); 

const app = express();
app.use(express.json());

// console.log(app);


mongoose
.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((error) => {
    console.log("MongoDB connection failed:", error);
  });





  app.use("/api/posts", postRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/posts", commentRoutes);
  app.use("/api", userRoutes);





app.listen(5000,()=>{
    console.log("Server is Runnig on port 5000");
})


