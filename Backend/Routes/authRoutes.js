
import express from "express";
import {Signup, Login, logoutUser} from "../Controllers/authControllers.js";

const router = express.Router();


router.post("/signup", Signup)
router.post("/login",Login);
router.post("/logout", logoutUser);



export default router;