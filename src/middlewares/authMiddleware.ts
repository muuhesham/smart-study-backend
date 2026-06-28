import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { JWT_KEY } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

interface DataToken {
  _id: string;
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Unauthorized", 401));
  }

  const token = authHeader.split(" ")[1];
  try {
    const decodedToken = jwt.verify(token!, JWT_KEY!) as unknown as DataToken;
    req.user = decodedToken;
    next();
  } catch (err) {
    return next(new AppError("Invalid token", 401));
  }
};
