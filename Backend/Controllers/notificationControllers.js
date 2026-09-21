import Notification from "../Models/Notification.js";

const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      recipient: req.userId,
    })
      .populate("sender", "name email")
      .populate("post", "content")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      notifications,
    });
  } catch (error) {
    next(error);
  }
};

const markNotificationAsRead = async (req, res, next) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    if (notification.recipient.toString() !== req.userId.toString()) {
      return res.status(403).json({
        message: "You cannot update this notification",
      });
    }

    notification.isRead = true;

    await notification.save();

    return res.status(200).json({
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    next(error);
  }
};

export { getNotifications, markNotificationAsRead };
