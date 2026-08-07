import { Router } from "express";
import planController from "../controllers/planController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import planValidators from "../validations/planValidators.js";

const router = Router();

router.use(authMiddleware);

router.get("/", planController.getPlan);
router.post("/generate", planController.generatePlan);
router.patch(
  "/:id/status",
  validate(planValidators.updateStatus),
  planController.updateStatus,
);

export default router;
