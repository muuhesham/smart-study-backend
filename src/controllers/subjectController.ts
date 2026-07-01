import { Request, Response } from "express";
import subjectService from "../services/subjectService.js";
import asyncHandler from "../middlewares/asyncHandler.js";

const subjectController = {
  getSubjects: asyncHandler(async (req: Request, res: Response) => {
    const subjects = await subjectService.getSubjectsByUser(req.user!._id);
    res.json({ success: true, data: subjects });
  }),

  addSubject: asyncHandler(async (req: Request, res: Response) => {
    const subject = await subjectService.addSubject(req.user!._id, req.body);
    res.status(201).json({ success: true, data: subject });
  }),

  deleteSubject: asyncHandler(async (req: Request, res: Response) => {
    await subjectService.deleteSubject(req.params.id!, req.user!._id);
    res.json({ success: true, message: "Subject removed successfully" });
  }),

  updateSubject: asyncHandler(async (req: Request, res: Response) => {
    const subject = await subjectService.updateSubject(req.params.id!, req.user!._id, req.body);
    res.json({ success: true, data: subject });
  }),
};

export default subjectController;
