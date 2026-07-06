import { Request, Response } from "express";
import dashboardService from "../services/dashboardService.js";
import reminderService from "../services/reminderService.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import { sendResponse } from "../utils/sendResponse.js";

const dashboardController = {
  getSummary: asyncHandler(async (req: Request, res: Response) => {
    const summary = await dashboardService.getSummary(req.user._id);
    return sendResponse(res, 200, true, undefined, summary);
  }),

  getReminders: asyncHandler(async (req: Request, res: Response) => {
    const rawWithinDays = Number(req.query.withinDays);
    const withinDays = Number.isFinite(rawWithinDays) && rawWithinDays > 0 ? rawWithinDays : 3;

    const reminders = await reminderService.getReminders(req.user._id, withinDays);
    return sendResponse(res, 200, true, undefined, reminders);
  }),
};

export default dashboardController;
