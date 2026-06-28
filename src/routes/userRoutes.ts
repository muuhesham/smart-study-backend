import { Router } from "express";
import userController from "../controllers/userController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { apiLimiter, profileLimiter } from "../middlewares/rateLimiter.js";
import { validate } from "../middlewares/validate.js";
import userValidators from "../validations/userValidators.js";

const router = Router();

router.get(
  "/profile",
  apiLimiter,
  authMiddleware,
  userController.userProfile,
);

router.put(
  "/profile",
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

router.delete(
  "/profile",
  authMiddleware,
  userController.deleteProfile,
);

export default router;
