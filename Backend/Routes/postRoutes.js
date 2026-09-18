import express from "express";
import authMiddleware from "../Middleware/authMiddleware.js";
import { createPost, deletePost, getPost, likePost, resharePost, updatePost } from "../Controllers/postControllers.js";

const router = express.Router();

router.post("/", authMiddleware,createPost );
router.get("/", authMiddleware, getPost);
router.patch("/:postId", authMiddleware, updatePost);
router.delete("/:postId", authMiddleware, deletePost);
router.post("/:postId/like", authMiddleware, likePost);
router.post("/:postId/reshare", authMiddleware, resharePost);

export default router;
