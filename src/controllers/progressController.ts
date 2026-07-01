import { Request, Response } from "express";
import progressService from "../services/progressService.js";
import asyncHandler from "../middlewares/asyncHandler.js";

const progressController = {
  getProgress: asyncHandler(async (req: Request, res: Response) => {
    const progress = await progressService.getProgressByUser(req.user!._id);
    res.json({ success: true, data: progress });
  }),

  updateProgress: asyncHandler(async (req: Request, res: Response) => {
    const progress = await progressService.updateProgress(req.user!._id, req.body);
    res.json({ success: true, data: progress });
  }),
};

export default progressController;
