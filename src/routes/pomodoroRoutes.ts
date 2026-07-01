import { Router } from "express";
import pomodoroController from "../controllers/pomodoroController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/pomodoro/today", authMiddleware, pomodoroController.getToday);
router.post("/pomodoro/sessions/:id/complete", authMiddleware, pomodoroController.completeSession);
router.post("/pomodoro/today/reset", authMiddleware, pomodoroController.resetToday);

export default router;
