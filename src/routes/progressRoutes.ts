import { Router } from "express";
import progressController from "../controllers/progressController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import progressValidators from "../validations/progressValidators.js";

const router = Router();

router.get("/", authMiddleware, progressController.getProgress);
router.post(
  "/",
  authMiddleware,
  validate(progressValidators.updateProgress),
  progressController.updateProgress,
);

export default router;
