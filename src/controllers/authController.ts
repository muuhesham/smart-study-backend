import { Request, Response } from "express";
import authService from "../services/authService.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import { sendResponse } from "../utils/sendResponse.js";

const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password, dailyStudyHours } = req.body;
    const { token, user } = await authService.register({
      name,
      email,
      password,
      dailyStudyHours: Number(dailyStudyHours),
    });
    return sendResponse(res, 201, true, "User registered successfully", {
      token,
      user,
    });
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const { token, user } = await authService.login({ email, password });
    return sendResponse(res, 200, true, "User login successfully", {
      token,
      user,
    });
  }),

  forgotPassword: asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    await authService.forgotPassword({ email });
    return sendResponse(res, 200, true, "OTP sent to your email");
  }),

  verifyPassword: asyncHandler(async (req: Request, res: Response) => {
    const { email, otp, newPassword } = req.body;
    await authService.verifyPassword({ email, otp, newPassword });
    return sendResponse(res, 200, true, "Password updated successfully");
  }),

  logout: asyncHandler(async (_req: Request, res: Response) => {
    return sendResponse(res, 200, true, "Logout Successfully");
  }),
};

export default authController;
