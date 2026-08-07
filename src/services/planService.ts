import StudyPlan, { IStudyPlan, StudyPlanStatus } from "../models/StudyPlan.js";
import Subject, { ISubject } from "../models/Subject.js";
import User from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import {
  addDays,
  daysBetween,
  formatDateISO,
  startOfDay,
} from "../utils/date.js";
import progressService from "./progressService.js";
import { studyPlanStatus } from "../constants/enums/studyPlanStatus.js";
import { dashboardCache } from "../utils/cache.js";

const PLAN_LENGTH_DAYS = 7;

const TIME_SLOTS = ["09:00", "11:00", "14:00", "16:00", "18:00"];

const FALLBACK_TOPICS = ["Review", "Practice problems", "Reading & notes"];

interface PlanEntryDraft {
  userId: string;
  subjectId: unknown;
  day: string;
  time: string;
  topic: string;
  durationMinutes: number;
  status: StudyPlanStatus;
}

function scoreSubjectForDay(
  subject: ISubject,
  studyDay: Date,
): { priority: number; daysUntilExam: number } {
  const daysUntilExam = Math.max(0, daysBetween(studyDay, subject.examDate));
  return {
    daysUntilExam,
    priority: subject.difficulty * 3 + 100 / (daysUntilExam + 1),
  };
}

function hoursForPriority(
  daysUntilExam: number,
  priority: number,
  remainingHours: number,
): number {
  if (daysUntilExam <= 1) {
    return Math.min(3, remainingHours);
  }
  if (daysUntilExam <= 3 || priority >= 18) {
    return Math.min(2, remainingHours);
  }
  return Math.min(1, remainingHours);
}

function nextTopic(
  subject: ISubject,
  topicCursor: Map<string, number>,
): string {
  const key = String(subject._id);
  const pool = subject.topics.length > 0 ? subject.topics : FALLBACK_TOPICS;
  const index = topicCursor.get(key) ?? 0;
  topicCursor.set(key, index + 1);
  return pool[index % pool.length]!;
}

function buildPlanEntries(
  userId: string,
  subjects: ISubject[],
  startDate: Date,
  dailyHours: number,
): PlanEntryDraft[] {
  const entries: PlanEntryDraft[] = [];
  const topicCursor = new Map<string, number>();

  for (let offset = 0; offset < PLAN_LENGTH_DAYS; offset++) {
    const studyDay = addDays(startDate, offset);
    const dayKey = formatDateISO(studyDay);

    const activeSubjects = subjects.filter(
      (subject) => daysBetween(studyDay, subject.examDate) >= 0,
    );
    if (activeSubjects.length === 0) continue;

    const scored = activeSubjects
      .map((subject) => ({ subject, ...scoreSubjectForDay(subject, studyDay) }))
      .sort((a, b) => b.priority - a.priority);

    let remainingHours = dailyHours;
    let slotIndex = 0;

    for (const item of scored) {
      if (remainingHours <= 0) break;

      const durationHours = hoursForPriority(
        item.daysUntilExam,
        item.priority,
        remainingHours,
      );
      if (durationHours <= 0) continue;

      entries.push({
        userId,
        subjectId: item.subject._id,
        day: dayKey,
        time: TIME_SLOTS[Math.min(slotIndex, TIME_SLOTS.length - 1)]!,
        topic: nextTopic(item.subject, topicCursor),
        durationMinutes: Math.round(durationHours * 60),
        status: studyPlanStatus.PENDING,
      });
      remainingHours -= durationHours;
      slotIndex += 1;
    }
  }

  return entries;
}

const planService = {
  getPlanByUser: async (userId: string): Promise<IStudyPlan[]> => {
    return await StudyPlan.find({ userId })
      .select("-createdAt -updatedAt -__v")
      .populate("subjectId", "name icon")
      .sort({ day: 1, time: 1 });
  },

  generatePlan: async (userId: string): Promise<IStudyPlan[]> => {
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);

    const allSubjects = await Subject.find({ userId });
    if (allSubjects.length === 0) {
      throw new AppError("No subjects found. Please add subjects first.", 400);
    }

    const dailyHours = user.dailyStudyHours ?? 4;
    const startDate = startOfDay(new Date());
    const planEntries = buildPlanEntries(
      userId,
      allSubjects,
      startDate,
      dailyHours,
    );

    if (planEntries.length === 0) {
      throw new AppError(
        "All your subjects' exams have already passed - nothing left to plan for.",
        400,
      );
    }

    await StudyPlan.deleteMany({ userId });
    await StudyPlan.insertMany(planEntries);
    dashboardCache.delete(userId);
    return await StudyPlan.find({ userId })
      .populate("subjectId", "name icon")
      .sort({ day: 1, time: 1 });
  },

  updateStatus: async (
    planId: string,
    userId: string,
    status: StudyPlanStatus,
  ): Promise<IStudyPlan> => {
    if (!planId) {
      throw new AppError("Plan ID is required", 400);
    }

    const plan = await StudyPlan.findOne({ _id: planId, userId });
    if (!plan) {
      throw new AppError("Plan task not found or unauthorized", 404);
    }

    if (plan.status === status) {
      return plan;
    }

    const hours = plan.durationMinutes / 60;
    const planSubjectId = String(plan.subjectId);
    const adjustment = status === studyPlanStatus.DONE ? hours : -hours;

    plan.status = status;
    await plan.save();
    await progressService.adjustStudyHours(
      userId,
      planSubjectId,
      plan.day,
      adjustment,
    );

    dashboardCache.delete(userId);
    return plan;
  },
};

export default planService;
