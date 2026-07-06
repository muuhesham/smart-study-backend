import { Router } from "express";
import userController from "../controllers/userController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { apiLimiter, profileLimiter } from "../middlewares/rateLimiter.js";
import { validate } from "../middlewares/validate.js";
import userValidators from "../validations/userValidators.js";

const router = Router();

router.get(
  "/me",
  apiLimiter,
  authMiddleware,
  userController.getUserProfile,
);

router.put(
  "/update-name",
  profileLimiter,
  authMiddleware,
  validate(userValidators.updateUsername),
  userController.changeUserName,
);

router.put(
  "/change-password",
  profileLimiter,
  authMiddleware,
  validate(userValidators.changePassword),
  userController.changePassword,
);

router.put(
  "/update-email",
  profileLimiter,
  authMiddleware,
  userController.changeEmail,
);

router.put(
  "/update-daily-hours",
  profileLimiter,
  authMiddleware,
  validate(userValidators.changeDailyHours),
  userController.changeDailyHours,
);

router.delete(
  "/",
  authMiddleware,
  userController.deleteProfile,
);

export default router;
