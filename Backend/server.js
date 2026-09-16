// this is the entry point of our backend
// const express = require("express")


import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./Models/User.js";
import authMiddleware from "./Middleware/authMiddleware.js";


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


app.get("/",(req,res)=>{
    res.send("hey There, Goodmorning")
})


app.post("/api/auth/signup", async(req,res)=>{
    // console.log(req.body);
    
     try {
       const { name, email, password } = req.body;

       if (!name || !email || !password) {
         return res.status(400).json({
           message: "All fields are required",
         });
       }

       const existingUser = await User.findOne({ email: email });

       if (existingUser) {
         return res.status(409).json({
           message: "User Already Exists",
         });
       }

       const hashedPassword = await bcrypt.hash(password, 10);

       const user = await User.create({
         name,
         email,
         password: hashedPassword,
       });


        res.status(201).json({
            message: "User created successfully",
            userId: user._id,
        });

     } catch (err) {
       res.status(500).json({
        message:"Server error"
       })
     }


    // res.json({
    //     message:"Signup route wroking"
    // });
})


app.post("/api/auth/login", async (req, res) => {
 

  try {
    const {email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const CurrentUser = await User.findOne({ email: email });

    if (!CurrentUser) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      CurrentUser.password,
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { userId: CurrentUser._id,
        email: CurrentUser.email,
       },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );
   

   return res.status(200).json({
     message: "Login successful",
     token,
   });


  } catch (err) {
    res.status(500).json({
      message: "Server error",
    });
  }

  // res.json({
  //     message:"Signup route wroking"
  // });
});


app.get("/api/profile", authMiddleware, (req, res) => {
  res.json({
    message: "You are authenticated",
    userId: req.userId,
  });
});

app.listen(5000,()=>{
    console.log("Server is Runnig on port 5000");
})


