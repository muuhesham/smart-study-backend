import mongoose from "mongoose";
import Subject from "../models/Subject.js";
import StudyPlan from "../models/StudyPlan.js";
import Progress from "../models/Progress.js";
import {
  formatDateISO,
  getWeekRange,
  weekdayShortLabel,
  addDays,
} from "../utils/date.js";
import { studyPlanStatus } from "../constants/enums/studyPlanStatus.js";
import { dashboardCache } from "../utils/cache.js";

const WEEKLY_POMODORO_GOAL_PER_DAY = 8;

type ProgressDayEntry = {
  _id: string;
  studyHours: number;
  pomodorosCompleted: number;
};

type LastWeekEntry = {
  _id: null;
  studyHours: number;
};

type PlanStatusEntry = {
  _id: string;
  count: number;
};

type SubjectPlanSummary = {
  _id: mongoose.Types.ObjectId;
  total: number;
  done: number;
};

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function getWeekBounds(today: Date) {
  const { start: weekStart, end: weekEnd } = getWeekRange(today);
  const { start: lastWeekStart, end: lastWeekEnd } = getWeekRange(
    addDays(weekStart, -1),
  );

  return {
    today,
    weekStart,
    weekEnd,
    lastWeekStart,
    lastWeekEnd,
  };
}

function buildWeeklyStudyHours(
  weekStart: Date,
  progressEntries: ProgressDayEntry[],
) {
  const hoursByDay = new Map<string, number>();

  for (const entry of progressEntries) {
    const currentHours = hoursByDay.get(entry._id) ?? 0;
    hoursByDay.set(entry._id, round2(currentHours + entry.studyHours));
  }

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(weekStart, index);
    const key = formatDateISO(date);

    return {
      day: weekdayShortLabel(date),
      date: key,
      hours: hoursByDay.get(key) ?? 0,
    };
  });
}

function buildSubjectProgress(
  subjects: any[],
  planTasks: SubjectPlanSummary[],
) {
  const subjectTaskMap = new Map<string, { total: number; done: number }>();

  for (const task of planTasks) {
    subjectTaskMap.set(task._id.toString(), {
      total: task.total,
      done: task.done,
    });
  }

  return subjects.map((subject) => {
    const key = subject._id.toString();
    const entry = subjectTaskMap.get(key);
    const percent =
      !entry || entry.total === 0
        ? 0
        : Math.round((entry.done / entry.total) * 100);

    return { subjectId: subject._id, name: subject.name, percent };
  });
}

const dashboardService = {
  getSummary: async (userId: string) => {
    if (dashboardCache.has(userId)) {
      return dashboardCache.get(userId);
    }

    const today = new Date();
    const todayKey = formatDateISO(today);
    const { weekStart, weekEnd, lastWeekStart, lastWeekEnd } =
      getWeekBounds(today);

    const weekStartKey = formatDateISO(weekStart);
    const weekEndKey = formatDateISO(weekEnd);
    const lastWeekStartKey = formatDateISO(lastWeekStart);
    const lastWeekEndKey = formatDateISO(lastWeekEnd);

    const userObjectId =
      typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;

    const [subjects, [progressFacet], [planFacet]] = await Promise.all([
      Subject.aggregate([
        { $match: { userId: userObjectId } },
        { $sort: { examDate: 1 } },
      ]),
      Progress.aggregate([
        {
          $match: {
            userId: userObjectId,
            day: { $gte: lastWeekStartKey, $lte: weekEndKey },
          },
        },
        {
          $facet: {
            thisWeek: [
              { $match: { day: { $gte: weekStartKey, $lte: weekEndKey } } },
              {
                $group: {
                  _id: "$day",
                  studyHours: { $sum: "$studyHours" },
                  pomodorosCompleted: { $sum: "$pomodorosCompleted" },
                },
              },
              { $sort: { _id: 1 } },
            ],
            lastWeek: [
              {
                $match: {
                  day: { $gte: lastWeekStartKey, $lte: lastWeekEndKey },
                },
              },
              { $group: { _id: null, studyHours: { $sum: "$studyHours" } } },
            ],
          },
        },
      ]),
      StudyPlan.aggregate([
        { $match: { userId: userObjectId } },
        {
          $facet: {
            thisWeek: [
              { $match: { day: { $gte: weekStartKey, $lte: weekEndKey } } },
              { $group: { _id: "$status", count: { $sum: 1 } } },
            ],
            allBySubject: [
              {
                $group: {
                  _id: "$subjectId",
                  total: { $sum: 1 },
                  done: {
                    $sum: {
                      $cond: [{ $eq: ["$status", studyPlanStatus.DONE] }, 1, 0],
                    },
                  },
                },
              },
            ],
            today: [
              { $match: { day: todayKey } },
              { $sort: { time: 1 } },
              {
                $lookup: {
                  from: "subjects",
                  localField: "subjectId",
                  foreignField: "_id",
                  as: "subject",
                },
              },
              {
                $unwind: { path: "$subject", preserveNullAndEmptyArrays: true },
              },
              {
                $addFields: {
                  subjectId: {
                    _id: "$subject._id",
                    name: "$subject.name",
                    icon: "$subject.icon",
                  },
                },
              },
              { $project: { subject: 0 } },
            ],
          },
        },
      ]),
    ]);

    const thisWeekProgress: ProgressDayEntry[] = progressFacet?.thisWeek ?? [];
    const lastWeekProgress: LastWeekEntry[] = progressFacet?.lastWeek ?? [];
    const thisWeekPlanTasks: PlanStatusEntry[] = planFacet?.thisWeek ?? [];
    const allPlanTasks: SubjectPlanSummary[] = planFacet?.allBySubject ?? [];
    const todaysPlan = planFacet?.today ?? [];

    const studyHoursThisWeek = round2(
      thisWeekProgress.reduce(
        (sum: number, entry: ProgressDayEntry) => sum + entry.studyHours,
        0,
      ),
    );
    const studyHoursLastWeek = round2(
      lastWeekProgress.length ? lastWeekProgress[0].studyHours : 0,
    );
    const studyHoursDeltaVsLastWeek = round2(
      studyHoursThisWeek - studyHoursLastWeek,
    );
    const examsThisWeek = subjects.filter(
      (subject) =>
        subject.examDate.getTime() >= weekStart.getTime() &&
        subject.examDate.getTime() <= weekEnd.getTime(),
    ).length;

    const thisWeekTaskCount = thisWeekPlanTasks.reduce(
      (sum: number, entry: PlanStatusEntry) => sum + entry.count,
      0,
    );
    const thisWeekDoneCount =
      thisWeekPlanTasks.find(
        (entry: PlanStatusEntry) => entry._id === studyPlanStatus.DONE,
      )?.count ?? 0;
    const tasksCompletedPercent =
      thisWeekTaskCount === 0
        ? 0
        : Math.round((thisWeekDoneCount / thisWeekTaskCount) * 100);

    const pomodorosToday =
      thisWeekProgress.find((entry: ProgressDayEntry) => entry._id === todayKey)
        ?.pomodorosCompleted ?? 0;

    const weeklyStudyHours = buildWeeklyStudyHours(weekStart, thisWeekProgress);
    const subjectProgress = buildSubjectProgress(subjects, allPlanTasks);

    const finalResult = {
      studyHoursThisWeek,
      studyHoursDeltaVsLastWeek,
      subjectsCount: subjects.length,
      examsThisWeek,
      tasksCompletedPercent,
      pomodorosToday,
      pomodoroGoalToday: WEEKLY_POMODORO_GOAL_PER_DAY,
      weeklyStudyHours,
      subjectProgress,
      todaysPlan,
      todaysSessionsCount: todaysPlan.length,
    };

    dashboardCache.set(userId, finalResult);
    return finalResult;
  },
};

export default dashboardService;
