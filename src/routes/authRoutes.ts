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

router.post(
  "/forgot-password",
  authLimiter,
  validate(authValidators.forgotPassword),
  authController.resetPassword
);

router.post(
  '/logout',
  authLimiter,
  authController.logout
)

export default router;
