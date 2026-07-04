import { Router } from "express";
import planController from "../controllers/planController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import planValidators from "../validations/planValidators.js";

const router = Router();

router.get("/", authMiddleware, planController.getPlan);
router.post("/generate", authMiddleware, planController.generatePlan);
router.patch(
  "/:id/status",
  authMiddleware,
  validate(planValidators.updateStatus),
  planController.updateStatus,
);

export default router;
