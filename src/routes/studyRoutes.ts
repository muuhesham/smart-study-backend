import { Router } from "express";
import subjectController from "../controllers/subjectController.js";
import planController from "../controllers/planController.js";
import progressController from "../controllers/progressController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import subjectValidators from "../validations/subjectValidators.js";
import progressValidators from "../validations/progressValidators.js";
import planValidators from "../validations/planValidators.js";

const router = Router();

// Subject Routes
router.get("/subjects", authMiddleware, subjectController.getSubjects);
router.post(
  "/subjects",
  authMiddleware,
  validate(subjectValidators.addSubject),
  subjectController.addSubject,
);
router.delete("/subjects/:id", authMiddleware, subjectController.deleteSubject);
router.put(
  "/subjects/:id",
  authMiddleware,
  validate(subjectValidators.updateSubject),
  subjectController.updateSubject,
);

// Study Plan Routes
router.get("/plan", authMiddleware, planController.getPlan);
router.post("/plan/generate", authMiddleware, planController.generatePlan);
router.patch(
  "/plan/:id/status",
  authMiddleware,
  validate(planValidators.updateStatus),
  planController.updateStatus,
);

// Progress Routes
router.get("/progress", authMiddleware, progressController.getProgress);
router.post(
  "/progress",
  authMiddleware,
  validate(progressValidators.updateProgress),
  progressController.updateProgress,
);

export default router;
