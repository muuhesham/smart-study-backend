import { Router } from "express";
import pomodoroController from "../controllers/pomodoroController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/today", pomodoroController.getToday);
router.post("/sessions/:id/complete", pomodoroController.completeSession);
router.post("/today/reset", pomodoroController.resetToday);

export default router;
