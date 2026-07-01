import { Request, Response } from "express";
import planService from "../services/planService.js";
import asyncHandler from "../middlewares/asyncHandler.js";

const planController = {
  getPlan: asyncHandler(async (req: Request, res: Response) => {
    const plan = await planService.getPlanByUser(req.user!._id);
    res.json({ success: true, data: plan });
  }),

  generatePlan: asyncHandler(async (req: Request, res: Response) => {
    const plan = await planService.generatePlan(req.user!._id);
    res.status(201).json({ success: true, data: plan });
  }),

  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    const plan = await planService.updateStatus(req.params.id!, req.user!._id, req.body.status);
    res.json({ success: true, data: plan });
  }),
};

export default planController;
