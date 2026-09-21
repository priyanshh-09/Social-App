import User from "../Models/User.js";
import Post from "../Models/Post.js";
import {cloudinary,uploadToCloudinary} from "../Utils/cloudinary.js";
import Notification from "../Models/Notification.js";

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


const followUser = async (req, res, next) => {
    try {
        const targetUserId = req.params.userId;
        const currentUserId = req.userId;

        if (targetUserId === currentUserId) {
            return res.status(400).json({
                message: "You cannot follow yourself"
            });
        }

        const currentUser = await User.findById(currentUserId);
        const targetUser = await User.findById(targetUserId);

        if (!targetUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const alreadyFollowing = currentUser.following.some(
            (id) => id.toString() === targetUserId
        );

        if (alreadyFollowing) {
            currentUser.following = currentUser.following.filter(
                (id) => id.toString() !== targetUserId
            );

            targetUser.followers = targetUser.followers.filter(
                (id) => id.toString() !== currentUserId
            );

            await currentUser.save();
            await targetUser.save();

            return res.status(200).json({
                message: "User unfollowed"
            });
        }

        currentUser.following.push(targetUserId);
        targetUser.followers.push(currentUserId);

        await currentUser.save();
        await targetUser.save();

        await Notification.create({
          recipient: targetUserId,
          sender: currentUserId,
          type: "follow",
        });

        return res.status(200).json({
            message: "User followed"
        });

    } catch (error) {
        next(error);
    }
};

const getFollowers = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).populate(
      "followers",
      "name email",
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      followers: user.followers,
    });
  } catch (error) {
    next(error);
  }
};

const getFollowing = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).populate(
      "following",
      "name email",
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      following: user.following
    });
  } catch (error) {
    next(error);
  }
};

const getFollowStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUser = await User.findById(req.userId);

    if (!currentUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isFollowing = currentUser.following.some(
      (id) => id.toString() === userId,
    );

    return res.status(200).json({
      isFollowing,
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, bio } = req.body;

    
    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Name is required",
      });
    }
    
    const user = await User.findById(req.userId);

    
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    
    user.name = name.trim();
    
    if (bio !== undefined) {
      user.bio = bio.trim();
    }
    
    if (req.file) {
      // Delete old profile picture
      if (user.profilePicture?.publicId) {
        await cloudinary.uploader.destroy(user.profilePicture.publicId);
      }

      // Upload new profile picture
      const result = await uploadToCloudinary(req.file.buffer);

      user.profilePicture = {
        url: result.secure_url,
        publicId: result.public_id,
      };
    }
     await user.save(); 

     return res.status(200).json({
       message: "Profile updated successfully",
       user,
     });

  } catch (error) {
    next(error);
  }
};

const getUserProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isFollowing = user.followers.some(
      (id) => id.toString() === req.userId.toString(),
    );

    return res.status(200).json({
      user: {
        ...user.toObject(),
        followersCount: user.followers.length,
        followingCount: user.following.length,
        isFollowing,
      },
    });
  } catch (error) {
    next(error);
  }
};


export {
  getProfile,
  getProfilePost,
  getUser,
  followUser,
  getFollowers,
  getFollowing,
  getFollowStatus,
  updateProfile,
  getUserProfile,
};