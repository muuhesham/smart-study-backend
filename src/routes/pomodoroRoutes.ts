import { Router } from "express";
import pomodoroController from "../controllers/pomodoroController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/today", authMiddleware, pomodoroController.getToday);
router.post("/sessions/:id/complete", authMiddleware, pomodoroController.completeSession);
router.post("/today/reset", authMiddleware, pomodoroController.resetToday);

export default router;
