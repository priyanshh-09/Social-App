import Comment from "../Models/Comments.js";
import Post from "../Models/Post.js";
import AppError from "../Utils/AppError.js";

const createPost = async (req, res,next) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        message: "Post content is required",
      });
    }

    if (content.length > 500) {
      return res.status(400).json({
        message: "Post cannot exceed 500 characters",
      });
    }

    const post = await Post.create({
      content: content.trim(),
      author: req.userId,
    });

    return res.status(201).json({
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    console.log(error);
    next(error);

    // return res.status(500).json({
    //   message: "Server error",
    // });
  }
}

const getPost= async (req, res,next) => {
  try {
    const posts = await Post.find()
      .populate("author", "name email")
      .populate({
        path: "resharedFrom",
        populate: {
          path: "author",
          select: "name email",
        },
      })
      .sort({ createdAt: -1 });

    const postsWithDetails = await Promise.all(
      posts.map(async (post) => {
        const comments = await Comment.find({
          post: post._id,
        })
          .populate("author", "name email")
          .sort({ createdAt: -1 });

        const isLiked = post.likes.some(
          (userId) => userId.toString() === req.userId.toString(),
        );

        return {
          ...post.toObject(),
          likesCount: post.likes.length,
          commentsCount: comments.length,
          comments,
          isLiked,
        };
      }),
    );

    return res.status(200).json({
      posts: postsWithDetails,
    });
  } catch (error) {
    console.log(error);
     next(error)
    // return res.status(500).json({
    //   message: "Server error",
    // });
  }
}

const updatePost =  async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        message: "Post content is required",
      });
    }

    if (content.length > 500) {
      return res.status(400).json({
        message: "Post cannot exceed 500 characters",
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      throw new AppError("Post not found", 404);
    }

    // if (!post) {
    //   return res.status(404).json({
    //     message: "Post not found",
    //   });
    // }

    if (post.author.toString() !== req.userId.toString()) {
      return res.status(403).json({
        message: "You can only edit your own post",
      });
    }

    post.content = content.trim();

    await post.save();

    return res.status(200).json({
      message: "Post updated successfully",
      post,
    });
  } catch (error) {
    console.log(error);
      next(error);
    // return res.status(500).json({
    //   message: "Server error",
    // });
  }
}

const deletePost = async (req, res, next) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      throw new AppError("Post not found", 404);
    }

    // if (!post) {
    //   return res.status(404).json({
    //     message: "Post not found",
    //   });
    // }

    if (post.author.toString() !== req.userId.toString()) {
      return res.status(403).json({
        message: "You can only delete your own post",
      });
    }

    await Post.findByIdAndDelete(postId);

    return res.status(200).json({
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.log(error);
    next(error);
    // return res.status(500).json({
    //   message: "Server error",
    // });
  }
}

const likePost = async (req, res, next) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      throw new AppError("Post not found", 404);
    }

    // if (!post) {
    //   return res.status(404).json({
    //     message: "Post not found",
    //   });
    // }

    const alreadyLiked = post.likes.some(
      (userId) => userId.toString() === req.userId.toString(),
    );

    if (alreadyLiked) {
      post.likes = post.likes.filter(
        (userId) => userId.toString() !== req.userId.toString(),
      );
    } else {
      post.likes.push(req.userId);
    }

    await post.save();

    return res.status(200).json({
      message: alreadyLiked ? "Post unliked" : "Post liked",
      likesCount: post.likes.length,
    });
  } catch (error) {
    console.log(error);
     next(error);
    // return res.status(500).json({
    //   message: "Server error",
    // });
  }
}

const resharePost = async (req, res, next) => {
  try {
    const { postId } = req.params;

    const originalPost = await Post.findById(postId);

    if (!originalPost) {
      throw new AppError("Post not found", 404);
    }

    // if (!originalPost) {
    //   return res.status(404).json({
    //     message: "Post not found",
    //   });
    

    const reshare = await Post.create({
      content: originalPost.content,
      author: req.userId,
      resharedFrom: originalPost._id,
    });

    return res.status(201).json({
      message: "Post reshared successfully",
      post: reshare,
    });
  } catch (error) {
    console.log(error);
    next(error);
    // return res.status(500).json({
    //   message: "Server error",
    // });
  }
};


export {createPost,getPost, updatePost, deletePost, likePost, resharePost};