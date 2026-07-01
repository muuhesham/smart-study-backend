import { Request, Response } from "express";
import pomodoroService from "../services/pomodoroService.js";
import asyncHandler from "../middlewares/asyncHandler.js";

const pomodoroController = {
  // GET /pomodoro/today
  getToday: asyncHandler(async (req: Request, res: Response) => {
    const data = await pomodoroService.getTodaySessions(req.user!._id);
    res.json({ success: true, data });
  }),

  // POST /pomodoro/sessions/:id/complete
  completeSession: asyncHandler(async (req: Request, res: Response) => {
    const session = await pomodoroService.completeSession(req.user!._id, req.params.id!);
    res.json({ success: true, data: session });
  }),

  // POST /pomodoro/today/reset
  resetToday: asyncHandler(async (req: Request, res: Response) => {
    await pomodoroService.resetToday(req.user!._id);
    res.json({ success: true, message: "Today's Pomodoro queue has been reset" });
  }),
};

export default pomodoroController;
