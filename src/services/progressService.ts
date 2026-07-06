import Progress, { IProgress } from "../models/Progress.js";
import { dashboardCache } from "../utils/cache.js";

interface ProgressInput {
  subjectId: string;
  day: string;
  studyHours: number;
  notes?: string;
}

const progressService = {
  getProgressByUser: async (userId: string): Promise<IProgress[]> => {
    return await Progress.find({ userId }).populate("subjectId", "name").sort({ createdAt: -1 });
  },

  updateProgress: async (
    userId: string,
    data: ProgressInput,
  ): Promise<IProgress> => {
    const updatedProgress = await Progress.findOneAndUpdate(
      {userId, subjectId: data.subjectId, day: data.day},
      {$inc: {studyHours: data.studyHours},  ...(data.notes && {$set: {notes: data.notes} })},
      {new: true, upsert: true, runValidators: true}
    );

    dashboardCache.delete(userId);
    return updatedProgress  
  },

  adjustStudyHours: async (
    userId: string,
    subjectId: string,
    day: string,
    deltaHours: number,
  ): Promise<IProgress> => {
    let progress = await Progress.findOne({ userId, subjectId, day });

    if (!progress) {
      progress = new Progress({ userId, subjectId, day, studyHours: 0 });
    }

    progress.studyHours = Math.max(0, progress.studyHours + deltaHours);
    return await progress.save();
  },

  logCompletedPomodoroWorkBlock: async (
    userId: string,
    subjectId: string,
    day: string,
    workMinutes: number,
  ): Promise<IProgress> => {
    let progress = await Progress.findOne({ userId, subjectId, day });

    if (!progress) {
      progress = new Progress({ userId, subjectId, day, studyHours: 0, pomodorosCompleted: 0 });
    }

    progress.studyHours = Math.round((progress.studyHours + workMinutes / 60) * 100) / 100;
    progress.pomodorosCompleted += 1;
    return await progress.save();
  },
};

export default progressService;
