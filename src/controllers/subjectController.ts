import { Request, Response } from "express";
import subjectService from "../services/subjectService.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import { sendResponse } from "../utils/sendResponse.js";

const subjectController = {
  getSubjects: asyncHandler(async (req: Request, res: Response) => {
    const subjects = await subjectService.getSubjectsByUser(req.user!._id);
    return sendResponse(res, 200, true, undefined, subjects);
  }),

  addSubject: asyncHandler(async (req: Request, res: Response) => {
    const subject = await subjectService.addSubject(req.user!._id, req.body);
    return sendResponse(res, 201, true, undefined, subject);
  }),

  deleteSubject: asyncHandler(async (req: Request, res: Response) => {
    await subjectService.deleteSubject(req.params.id! as string, req.user!._id);
    return sendResponse(res, 200, true);
  }),

  updateSubject: asyncHandler(async (req: Request, res: Response) => {
    const subject = await subjectService.updateSubject(req.params.id! as string, req.user!._id, req.body);
    return sendResponse(res, 200, true, undefined, subject);
  }),
};

export default subjectController;
