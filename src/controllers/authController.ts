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

  resetPassword: asyncHandler(async (req: Request, res: Response) => {
    const { name, email, newPassword } = req.body;
    await authService.resetPassword({ name, email, newPassword });
    return sendResponse(res, 200, true, "Password Reset Successfully");
  }),

  logout: asyncHandler(async (_req: Request, res: Response) => {
    return sendResponse(res, 200, true, "Logout Successfully");
  }),
};

export default authController;
