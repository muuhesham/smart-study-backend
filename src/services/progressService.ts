import Progress, { IProgress } from "../models/Progress.js";

const progressService = {
  getProgressByUser: async (userId: string): Promise<IProgress[]> => {
    return await Progress.find({ userId }).populate("subjectId", "name").sort({ createdAt: -1 });
  },

  updateProgress: async (
    userId: string,
    data: { subjectId: string; day: string; studyHours: number; notes?: string },
  ): Promise<IProgress> => {
    let progress = await Progress.findOne({
      userId,
      subjectId: data.subjectId,
      day: data.day,
    });

    if (progress) {
      progress.studyHours += data.studyHours;
      if (data.notes) progress.notes = data.notes;
      return await progress.save();
    }

    progress = new Progress({
      userId,
      subjectId: data.subjectId,
      day: data.day,
      studyHours: data.studyHours,
      notes: data.notes,
    });
    return await progress.save();
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
