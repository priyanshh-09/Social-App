import express from "express";
import Post from "../Models/Post.js";
import Comment from "../Models/Comments.js";
import authMiddleware from "../Middleware/authMiddleware.js";
import { deleteComment, getComment, postComment } from "../Controllers/commentsControllers.js";

const router = express.Router();

router.post("/:postId/comments", authMiddleware, postComment);
router.get("/:postId/comments",getComment );
router.delete("/:postId/comments/:commentId",
authMiddleware,
 deleteComment
);

export default router;