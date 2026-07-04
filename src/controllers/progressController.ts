import { Request, Response } from "express";
import progressService from "../services/progressService.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import { sendResponse } from "../utils/sendResponse.js";

const progressController = {
  getProgress: asyncHandler(async (req: Request, res: Response) => {
    const progress = await progressService.getProgressByUser(req.user!._id);
    return sendResponse(res, 200, true, undefined, progress);
  }),

  updateProgress: asyncHandler(async (req: Request, res: Response) => {
    const progress = await progressService.updateProgress(req.user!._id, req.body);
    return sendResponse(res, 200, true, undefined, progress);
  }),
};

export default progressController;
