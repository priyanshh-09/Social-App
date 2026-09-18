import express from "express";
import authMiddleware from "../Middleware/authMiddleware.js";
import { getProfile, getProfilePost, getUser } from "../Controllers/userControllers.js";

const router = express.Router();

router.get("/profile", authMiddleware, getProfile);
router.get("/profile/posts", authMiddleware, getProfilePost);
router.get("/users/:userId", getUser);


export default router;
