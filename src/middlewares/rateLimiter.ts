import { rateLimit } from "express-rate-limit";
import { AppError } from "../utils/AppError.js";

const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 100,
  handler: (req, res, next) => {
    next(
      new AppError(
        "Too many requests from this IP, please try again later.",
        429,
      ),
    );
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  handler: (req, res, next) => {
    next(new AppError("Too many login requests, please try again later.", 429));
  },
});

const profileLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 3,
  handler: (req, res, next) => {
    next(
      new AppError("Too many update requests, please try again later.", 429),
    );
  },
});

export { apiLimiter, authLimiter, profileLimiter };
