import { Request, Response } from "express";
import authService from "../services/authService.js";
import asyncHandler from "../middlewares/asyncHandler.js";

const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password, dailyStudyHours } = req.body;
    const { token, user } = await authService.register({
      name,
      email,
      password,
      dailyStudyHours: Number(dailyStudyHours),
    });
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user,
    });
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const { token, user } = await authService.login({ email, password });
    res.json({ success: true, token, user });
  }),
};

export default authController;
