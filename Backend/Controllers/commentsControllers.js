
import Post from "../Models/Post.js";
import Comment from "../Models/Comments.js";
import Notification from "../Models/Notification.js";


const postComment = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        message: "Comment content is required",
      });
    }

    if (content.length > 300) {
      return res.status(400).json({
        message: "Comment cannot exceed 300 characters",
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const comment = await Comment.create({
    content,
    author: req.userId,
    post: postId,
});

if (post.author.toString() !== req.userId.toString()) {
    await Notification.create({
        recipient: post.author,
        sender: req.userId,
        type: "comment",
        post: post._id,
        comment: comment._id
    });
}

return res.status(201).json({
      message: "Comment added successfully",
      comment,
    });
  } catch (error) {
    console.log(error);
    next(error);

    // return res.status(500).json({
    //   message: "Server error",
    // });
  }
};

const getComment = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({ post: postId })
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      comments,
    });
  } catch (error) {
    console.log(error);
    next(error);
    // return res.status(500).json({
    //   message: "Server error",
    // });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;

    const comment = await Comment.findOne({
      _id: commentId,
      post: postId,
    });

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    if (comment.author.toString() !== req.userId.toString()) {
      return res.status(403).json({
        message: "You can only delete your own comment",
      });
    }

    await Comment.findByIdAndDelete(commentId);

    return res.status(200).json({
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.log(error);
      next(error);
    // return res.status(500).json({
    //   message: "Server error",
    // });
  }
};

export { postComment, getComment, deleteComment };
