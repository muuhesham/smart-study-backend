import Subject, { ISubject } from "../models/Subject.js";
import { AppError } from "../utils/AppError.js";

interface SubjectInput {
  name: string;
  difficulty: number;
  examDate: Date;
  icon?: string;
  targetHoursPerWeek?: number;
  topics?: string[];
}

const subjectService = {
  getSubjectsByUser: async (userId: string): Promise<ISubject[]> => {
    return await Subject.find({ userId }).sort({ examDate: 1 });
  },

  addSubject: async (userId: string, data: SubjectInput): Promise<ISubject> => {
    const newSubject = new Subject({
      userId,
      ...data,
    });
    return await newSubject.save();
  },

  deleteSubject: async (subjectId: string, userId: string): Promise<void> => {
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      throw new AppError("Subject not found", 404);
    }
    if (subject.userId.toString() !== userId) {
      throw new AppError("User not authorized to delete this subject", 403);
    }
    await Subject.findByIdAndDelete(subjectId);
  },

  updateSubject: async (
    subjectId: string,
    userId: string,
    data: Partial<SubjectInput>,
  ): Promise<ISubject> => {
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      throw new AppError("Subject not found", 404);
    }
    if (subject.userId.toString() !== userId) {
      throw new AppError("User not authorized to update this subject", 403);
    }

    if (data.name !== undefined) subject.name = data.name;
    if (data.difficulty !== undefined) subject.difficulty = data.difficulty;
    if (data.examDate !== undefined) subject.examDate = data.examDate;
    if (data.icon !== undefined) subject.icon = data.icon;
    if (data.targetHoursPerWeek !== undefined) subject.targetHoursPerWeek = data.targetHoursPerWeek;
    if (data.topics !== undefined) subject.topics = data.topics;

    return await subject.save();
  },
};

export default subjectService;
