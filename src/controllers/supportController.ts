import { Request, Response } from "express";
import asyncHandler from "../middlewares/asyncHandler.js";
import { sendResponse } from "../utils/sendResponse.js";
import supportService from "../services/supportService.js";

const supportController = {
  report: asyncHandler(async (req: Request, res: Response) => {
    const { name, email, messageType, message } = req.body;
    await supportService.report({ name, email, messageType, message });
    return sendResponse(
      res,
      200,
      true,
      "Support request submitted successfully",
    );
  }),
};

export default supportController;
