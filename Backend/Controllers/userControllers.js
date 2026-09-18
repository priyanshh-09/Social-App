import User from "../Models/User.js";
import Post from "../Models/Post.js";

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      user,
    });
  } catch (error) {
    console.log(error);
   next(error)
    // return res.status(500).json({
    //   message: "Server error",
    // });
  }
};

const getProfilePost = async (req, res) => {
  try {
    const posts = await Post.find({
      author: req.userId,
    })
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      posts,
    });
  } catch (error) {
    console.log(error);
     next(error);
    // return res.status(500).json({
    //   message: "Server error",
    // });
  }
};

const getUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      user,
    });
  } catch (error) {
    console.log(error);
     next(error);
    // return res.status(500).json({
    //   message: "Server error",
    // });
  }
};

export {getProfile, getProfilePost, getUser};