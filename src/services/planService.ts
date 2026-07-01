import StudyPlan, { IStudyPlan, StudyPlanStatus } from "../models/StudyPlan.js";
import Subject, { ISubject } from "../models/Subject.js";
import User from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { addDays, daysBetween, formatDateISO, startOfDay } from "../utils/date.js";
import progressService from "./progressService.js";

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


function scoreSubjectForDay(subject: ISubject, studyDay: Date): { priority: number; daysUntilExam: number } {
  const daysUntilExam = Math.max(0, daysBetween(studyDay, subject.examDate));
  const urgency = 100 / (daysUntilExam + 1);
  const priority = subject.difficulty * 3 + urgency;
  return { priority, daysUntilExam };
}

function hoursForPriority(daysUntilExam: number, priority: number, remainingHours: number): number {
  if (daysUntilExam <= 1) {
    // Exam is today/tomorrow relative to this study day 
    return Math.min(3, remainingHours);
  }
  if (daysUntilExam <= 3 || priority >= 18) {
    return Math.min(2, remainingHours);
  }
  return Math.min(1, remainingHours);
}

// Picks the next topic for a subject, cycling through its topic list 
function nextTopic(subject: ISubject, topicCursor: Map<string, number>): string {
  const key = String(subject._id);
  const pool = subject.topics.length > 0 ? subject.topics : FALLBACK_TOPICS;
  const index = topicCursor.get(key) ?? 0;
  topicCursor.set(key, index + 1);
  return pool[index % pool.length]!;
}

const planService = {
  getPlanByUser: async (userId: string): Promise<IStudyPlan[]> => {
    return await StudyPlan.find({ userId }).populate("subjectId", "name icon").sort({ day: 1, time: 1 });
  },

  // Plan Generator Function
  generatePlan: async (userId: string): Promise<IStudyPlan[]> => {
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);

    const allSubjects = await Subject.find({ userId });
    if (allSubjects.length === 0) {
      throw new AppError("No subjects found. Please add subjects first.", 400);
    }

    const dailyHours = user.dailyStudyHours || 4;

    // The plan always starts the day AFTER it is generated.
    const startDate = addDays(startOfDay(new Date()), 1);

    const planEntries: PlanEntryDraft[] = [];
    const topicCursor = new Map<string, number>();

    for (let offset = 0; offset < PLAN_LENGTH_DAYS; offset++) {
      const studyDay = addDays(startDate, offset);
      const dayKey = formatDateISO(studyDay);

      // Only subjects whose exam hasn't happened yet 
      // (relative to this study day) are worth studying for.
      const activeSubjects = allSubjects.filter((s) => daysBetween(studyDay, s.examDate) >= 0);
      if (activeSubjects.length === 0) continue;

      const scored = activeSubjects
        .map((subject) => ({ subject, ...scoreSubjectForDay(subject, studyDay) }))
        .sort((a, b) => b.priority - a.priority);

      let remainingHours = dailyHours;
      let slotIndex = 0;
      for (const item of scored) {
        if (remainingHours <= 0) break;

        const hours = hoursForPriority(item.daysUntilExam, item.priority, remainingHours);
        if (hours > 0) {
          const time = TIME_SLOTS[Math.min(slotIndex, TIME_SLOTS.length - 1)]!;
          planEntries.push({
            userId,
            subjectId: item.subject._id,
            day: dayKey,
            time,
            topic: nextTopic(item.subject, topicCursor),
            durationMinutes: Math.round(hours * 60),
            status: "pending",
          });
          remainingHours -= hours;
          slotIndex += 1;
        }
      }
    }

    if (planEntries.length === 0) {
      throw new AppError(
        "All your subjects' exams have already passed - nothing left to plan for.",
        400,
      );
    }

    // Replace any previously generated plan for this user with the new one.
    await StudyPlan.deleteMany({ userId });
    await StudyPlan.insertMany(planEntries);

    return await StudyPlan.find({ userId }).populate("subjectId", "name icon").sort({ day: 1, time: 1 });
  },

  updateStatus: async (
    planId: string,
    userId: string,
    status: StudyPlanStatus,
  ): Promise<IStudyPlan> => {
    const plan = await StudyPlan.findById(planId);
    if (!plan) {
      throw new AppError("Plan task not found", 404);
    }
    if (plan.userId.toString() !== userId) {
      throw new AppError("User not authorized to update this task", 403);
    }
    if (plan.status === status) {
      return plan;
    }

    const hours = plan.durationMinutes / 60;
    if (status === "done") {
      await progressService.adjustStudyHours(userId, String(plan.subjectId), plan.day, hours);
    } else {
      await progressService.adjustStudyHours(userId, String(plan.subjectId), plan.day, -hours);
    }

    plan.status = status;
    return await plan.save();
  },
};

export default planService;
