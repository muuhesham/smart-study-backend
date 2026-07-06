import { Request, Response } from "express";
import planService from "../services/planService.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import { sendResponse } from "../utils/sendResponse.js";

const planController = {
  getPlan: asyncHandler(async (req: Request, res: Response) => {
    const plan = await planService.getPlanByUser(req.user._id);
    return sendResponse(res, 200, true, undefined, plan);
  }),

  generatePlan: asyncHandler(async (req: Request, res: Response) => {
    const plan = await planService.generatePlan(req.user._id);
    return sendResponse(res, 201, true, undefined, plan);
  }),

  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    const plan = await planService.updateStatus(req.params.id as string, req.user._id, req.body.status);
    return sendResponse(res, 200, true, "Plan Status Updated Successfully", plan);
  }),
};

export default planController;
