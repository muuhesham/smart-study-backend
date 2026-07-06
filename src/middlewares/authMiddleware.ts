import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/verifyToken.js";
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
    const decodedToken = verifyToken(token, JWT_KEY) as DataToken;
    if(!decodedToken){
      return next(new AppError("User not found or invalid token data", 401));
    }
    req.user = decodedToken;
    next();
  } catch (err) {
    return next(new AppError("Invalid token", 401));
  }
};
