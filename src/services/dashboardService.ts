import Subject from "../models/Subject.js";
import StudyPlan from "../models/StudyPlan.js";
import Progress from "../models/Progress.js";
import { formatDateISO, getWeekRange, weekdayShortLabel, addDays } from "../utils/date.js";
import { studyPlanStatus } from "../constants/enums/studyPlanStatus.js";
import { dashboardCache } from "../utils/cache.js";

const WEEKLY_POMODORO_GOAL_PER_DAY = 8;

const dashboardService = {
 
  getSummary: async (userId: string) => {
    if(dashboardCache.has(userId)){
      return dashboardCache.get(userId);
    }
    
    const today = new Date();
    const todayKey = formatDateISO(today);
    const { start: weekStart, end: weekEnd } = getWeekRange(today);
    const { start: lastWeekStart, end: lastWeekEnd } = getWeekRange(addDays(weekStart, -1));

    const weekStartKey = formatDateISO(weekStart);
    const weekEndKey = formatDateISO(weekEnd);
    const lastWeekStartKey = formatDateISO(lastWeekStart);
    const lastWeekEndKey = formatDateISO(lastWeekEnd);

    const [subjects, thisWeekProgress, lastWeekProgress, thisWeekPlanTasks, todaysPlan] = await Promise.all([
      Subject.find({ userId }).sort({ examDate: 1 }),
      Progress.find({ userId, day: { $gte: weekStartKey, $lte: weekEndKey } }).populate(
        "subjectId",
        "name",
      ),
      Progress.find({ userId, day: { $gte: lastWeekStartKey, $lte: lastWeekEndKey } }),
      StudyPlan.find({ userId, day: { $gte: weekStartKey, $lte: weekEndKey } }).populate(
        "subjectId",
        "name",
      ),
      StudyPlan.find({ userId, day: todayKey }).populate("subjectId", "name icon").sort({ time: 1 }),
    ]);

    // Study hours this week (+ delta vs last week) 
    const studyHoursThisWeek = round2(sum(thisWeekProgress.map((p) => p.studyHours)));
    const studyHoursLastWeek = round2(sum(lastWeekProgress.map((p) => p.studyHours)));
    const studyHoursDeltaVsLastWeek = round2(studyHoursThisWeek - studyHoursLastWeek);

    // Subjects tracked + exams this week 
    const examsThisWeek = subjects.filter(
      (s) => s.examDate.getTime() >= weekStart.getTime() && s.examDate.getTime() <= weekEnd.getTime(),
    ).length;

    // Tasks completed % (this week's plan tasks) 
    const tasksCompletedPercent =
      thisWeekPlanTasks.length === 0
        ? 0
        : Math.round(
            (thisWeekPlanTasks.filter((t) => t.status === studyPlanStatus.DONE).length / thisWeekPlanTasks.length) * 100,
          );

    // Pomodoros today (+ goal)
    const todaysProgress = thisWeekProgress.filter(p => p.day === todayKey);
    const pomodorosToday = sum(
      (todaysProgress.map(p => p.pomodorosCompleted)) || 0,
    );

    // Weekly study hours chart (Mon..Sun) 
    const hoursByDay = new Map<string, number>();
    for (const entry of thisWeekProgress) {
      hoursByDay.set(entry.day, round2((hoursByDay.get(entry.day) ?? 0) + entry.studyHours));
    }
    const weeklyStudyHours = Array.from({ length: 7 }, (_, i) => {
      const date = addDays(weekStart, i);
      const key = formatDateISO(date);
      return { day: weekdayShortLabel(date), date: key, hours: hoursByDay.get(key) ?? 0 };
    });

    // Subject progress % (completed vs total plan tasks, all currently generated plan) 
    const allPlanTasks = await StudyPlan.find({ userId });
    const bySubject = new Map<string, { name: string; total: number; done: number }>();
    for (const task of allPlanTasks) {
      const key = task.subjectId.toString();
      const entry = bySubject.get(key) ?? { name: "", total: 0, done: 0 };
      entry.total += 1;
      if (task.status === studyPlanStatus.DONE) entry.done += 1;
      bySubject.set(key, entry);
    }
    for (const subject of subjects) {
      const key = String(subject._id);
      if (bySubject.has(key)) {
        bySubject.get(key)!.name = subject.name;
      }
    }
    const subjectProgress = subjects.map((s) => {
      const entry = bySubject.get(String(s._id));
      const percent = !entry || entry.total === 0 ? 0 : Math.round((entry.done / entry.total) * 100);
      return { subjectId: s._id, name: s.name, percent };
    });
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
  }
};

function sum(values: number[]): number {
  return values.reduce((a, b) => a + b, 0);
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export default dashboardService;
