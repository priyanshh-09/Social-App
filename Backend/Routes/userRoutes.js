import express from "express";
import authMiddleware from "../Middleware/authMiddleware.js";
import { followUser, getFollowers, getFollowing, getFollowStatus, getProfile, getProfilePost, getUser, getUserProfile, updateProfile } from "../Controllers/userControllers.js";

import upload from "../Middleware/uploadMiddleware.js"

const router = express.Router();

router.get("/profile", authMiddleware, getProfile);
router.get("/profile/posts", authMiddleware, getProfilePost);
router.get("/users/:userId", getUser);
router.post("/users/:userId/follow",authMiddleware,followUser);
router.get("/users/:userId/followers",getFollowers);
router.get("/users/:userId/following",getFollowing);
router.get("/users/:userId/follow-status",authMiddleware, getFollowStatus);
router.patch("/profile",authMiddleware,upload.single("profilePicture"), updateProfile);
router.get("/users/:userId", authMiddleware, getUserProfile);





export default router;
