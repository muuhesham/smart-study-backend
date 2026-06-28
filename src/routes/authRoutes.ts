import { Router } from "express";
import authController from "../controllers/authController.js";
import { authLimiter } from "../middlewares/rateLimiter.js";
import { validate } from "../middlewares/validate.js";
import authValidators from "../validations/authValidators.js";

const router = Router();

router.post(
  "/register",
  authLimiter,
  validate(authValidators.register),
  authController.register,
);
router.post(
  "/login",
  authLimiter,
  validate(authValidators.login),
  authController.login,
);

export default router;
