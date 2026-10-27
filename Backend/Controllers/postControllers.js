import Comment from "../Models/Comments.js";
import Post from "../Models/Post.js";
import AppError from "../Utils/AppError.js";
import { getIO } from "../Utils/socket.js";
import User from "../Models/User.js";
import Notification from "../Models/Notification.js"

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

    getIO().to(`user:${post.author}`).emit("postLikesUpdated", {
      postId: post._id.toString(),
      likesCount: post.likes.length,
      isLiked: !alreadyLiked,
      userId: req.userId.toString(),
    });

    if (!alreadyLiked && post.author.toString() !== req.userId.toString()) {
      await Notification.create({
        recipient: post.author,
        sender: req.userId,
        type: "like",
        post: post._id,
      });
    }

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

const getFeed = async (req, res, next) => {
  try {

     const page = parseInt(req.query.page) || 1;
     const limit = parseInt(req.query.limit) || 10;

     const skip = (page - 1) * limit;

    // 1. Find the logged-in user
    const currentUser = await User.findById(req.userId);

    if (!currentUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // 2. Get the IDs of people I follow
    const followingIds = currentUser.following;

    // 3. Add my own ID
    const feedUserIds = [...followingIds, req.userId];

    // 4. Find posts made by these users
    const posts = await Post.find({
      author: { $in: feedUserIds },
    })
      .populate("author", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // 5. Add extra information to every post
    const postsWithDetails = await Promise.all(
      posts.map(async (post) => {
        // Number of likes
        const likesCount = post.likes.length;

        // Did the logged-in user like this post?
        const isLiked = post.likes.some(
          (userId) => userId.toString() === req.userId.toString(),
        );

        // Get comments for this post
        const comments = await Comment.find({
          post: post._id,
        })
          .populate("author", "name email")
          .sort({ createdAt: -1 });

        return {
          ...post.toObject(),
          likesCount,
          isLiked,
          commentsCount: comments.length,
          comments,
        };
      }),
    );

    // 6. Send the feed
    return res.status(200).json({
      posts: postsWithDetails,
    });
  } catch (error) {
    next(error);
  }
};

const getUserPosts = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const posts = await Post.find({
      author: userId,
    })
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    const postsWithDetails = await Promise.all(
      posts.map(async (post) => {
        const likesCount = post.likes.length;

        const isLiked = post.likes.some(
          (id) => id.toString() === req.userId.toString(),
        );

        const comments = await Comment.find({
          post: post._id,
        })
          .populate("author", "name email")
          .sort({ createdAt: -1 });

        return {
          ...post.toObject(),
          likesCount,
          isLiked,
          commentsCount: comments.length,
          comments,
        };
      }),
    );

    return res.status(200).json({
      posts: postsWithDetails,
    });
  } catch (error) {
    next(error);
  }
};


export {
  createPost,
  getPost,
  updatePost,
  deletePost,
  likePost,
  resharePost,
  getFeed,
  getUserPosts,
};