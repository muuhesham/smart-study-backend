import Progress, { IProgress } from "../models/Progress.js";
import { dashboardCache } from "../utils/cache.js";

interface ProgressInput {
  subjectId: string;
  day: string;
  studyHours: number;
  notes?: string;
}

async function getOrCreateProgress(
  userId: string,
  subjectId: string,
  day: string,
): Promise<IProgress> {
  return (
    (await Progress.findOne({ userId, subjectId, day })) ??
    new Progress({
      userId,
      subjectId,
      day,
      studyHours: 0,
      pomodorosCompleted: 0,
    })
  );
}

async function saveProgressChange(
  userId: string,
  subjectId: string,
  day: string,
  updateProgress: (progress: IProgress) => void,
): Promise<IProgress> {
  const progress = await getOrCreateProgress(userId, subjectId, day);
  updateProgress(progress);
  return progress.save();
}

const progressService = {
  getProgressByUser: async (userId: string): Promise<IProgress[]> => {
    return await Progress.find({ userId })
      .populate("subjectId", "name")
      .sort({ createdAt: -1 });
  },

  updateProgress: async (
    userId: string,
    data: ProgressInput,
  ): Promise<IProgress> => {
    const update: { $inc: { studyHours: number }; $set?: { notes: string } } = {
      $inc: { studyHours: data.studyHours },
    };
    if (data.notes) {
      update.$set = { notes: data.notes };
    }

    const updatedProgress = await Progress.findOneAndUpdate(
      { userId, subjectId: data.subjectId, day: data.day },
      update,
      { new: true, upsert: true, runValidators: true },
    );

    dashboardCache.delete(userId);
    return updatedProgress;
  },

  adjustStudyHours: async (
    userId: string,
    subjectId: string,
    day: string,
    deltaHours: number,
  ): Promise<IProgress> => {
    return saveProgressChange(userId, subjectId, day, (progress) => {
      progress.studyHours = Math.max(0, progress.studyHours + deltaHours);
    });
  },

  logCompletedPomodoroWorkBlock: async (
    userId: string,
    subjectId: string,
    day: string,
    workMinutes: number,
  ): Promise<IProgress> => {
    return saveProgressChange(userId, subjectId, day, (progress) => {
      progress.studyHours =
        Math.round((progress.studyHours + workMinutes / 60) * 100) / 100;
      progress.pomodorosCompleted += 1;
    });
  },
};

export default progressService;
