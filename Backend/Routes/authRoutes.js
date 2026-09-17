import User from "../Models/User.js";
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();


router.post("/signup", async(req,res)=>{
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


router.post("/login", async (req, res) => {
 

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


export default router;