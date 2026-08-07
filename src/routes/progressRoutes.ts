import { Router } from "express";
import progressController from "../controllers/progressController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import progressValidators from "../validations/progressValidators.js";

const router = Router();

router.use(authMiddleware);

router.get("/", progressController.getProgress);
router.post(
  "/",
  validate(progressValidators.updateProgress),
  progressController.updateProgress,
);

export default router;
