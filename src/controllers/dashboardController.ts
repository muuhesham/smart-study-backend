import { Request, Response } from "express";
import dashboardService from "../services/dashboardService.js";
import reminderService from "../services/reminderService.js";
import asyncHandler from "../middlewares/asyncHandler.js";

const dashboardController = {
  getSummary: asyncHandler(async (req: Request, res: Response) => {
    const summary = await dashboardService.getSummary(req.user!._id);
    res.json({ success: true, data: summary });
  }),

  getReminders: asyncHandler(async (req: Request, res: Response) => {
    const rawWithinDays = Number(req.query.withinDays);
    const withinDays = Number.isFinite(rawWithinDays) && rawWithinDays > 0 ? rawWithinDays : 3;

    const reminders = await reminderService.getReminders(req.user!._id, withinDays);
    res.json({ success: true, data: reminders });
  }),
};

export default dashboardController;
