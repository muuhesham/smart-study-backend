import { Request, Response } from "express";
import pomodoroService from "../services/pomodoroService.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import { sendResponse } from "../utils/sendResponse.js";

const pomodoroController = {
  getToday: asyncHandler(async (req: Request, res: Response) => {
    const data = await pomodoroService.getTodaySessions(req.user._id);
    return sendResponse(res, 200, true, undefined, data);
  }),

  completeSession: asyncHandler(async (req: Request, res: Response) => {
    const session = await pomodoroService.completeSession(req.user._id, req.params.id as string);
    return sendResponse(res, 200, true, undefined, session);
  }),

  resetToday: asyncHandler(async (req: Request, res: Response) => {
    await pomodoroService.resetToday(req.user._id);
    return sendResponse(res, 200, true, "Today's Pomodoro queue has been reset");
  }),
};

export default pomodoroController;
