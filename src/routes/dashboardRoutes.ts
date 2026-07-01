import { Router } from "express";
import dashboardController from "../controllers/dashboardController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/dashboard", authMiddleware, dashboardController.getSummary);
router.get("/reminders", authMiddleware, dashboardController.getReminders);

export default router;
