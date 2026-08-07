import { Router } from "express";
import supportController from "../controllers/supportController.js";
import { validate } from "../middlewares/validate.js";
import supportValidators from "../validations/supportValidators.js";

const router = Router();

router.post(
  "/report",
  validate(supportValidators.report),
  supportController.report,
);

export default router;
