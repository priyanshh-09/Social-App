import express from "express";
import authMiddleware from "../Middleware/authMiddleware.js";
import { getNotifications, markNotificationAsRead } from "../Controllers/notificationControllers.js";

const router = express.Router();

router.get("/", authMiddleware, getNotifications);
router.patch("/:notificationId/read", authMiddleware, markNotificationAsRead);

export default router;
