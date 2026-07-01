import PomodoroSession, { IPomodoroSession } from "../models/PomodoroSession.js";
import StudyPlan from "../models/StudyPlan.js";
import { AppError } from "../utils/AppError.js";
import { formatDateISO } from "../utils/date.js";
import { DEFAULT_POMODORO_CONFIG } from "../utils/pomodoro.js";
import progressService from "./progressService.js";

const WORK_MINUTES = DEFAULT_POMODORO_CONFIG.workMinutes;
const SHORT_BREAK_MINUTES = DEFAULT_POMODORO_CONFIG.shortBreakMinutes;
const LONG_BREAK_MINUTES = DEFAULT_POMODORO_CONFIG.longBreakMinutes;
const SESSIONS_BEFORE_LONG_BREAK = DEFAULT_POMODORO_CONFIG.sessionsBeforeLongBreak;

function buildQueueFromPlan(
  userId: string,
  day: string,
  tasks: { _id: unknown; subjectId: unknown; topic: string; durationMinutes: number }[],
): Partial<IPomodoroSession>[] {
  const queue: Partial<IPomodoroSession>[] = [];
  let workCount = 0;
  let sessionIndex = 0;

  for (const task of tasks) {
    const workBlocksForTask = Math.max(1, Math.ceil(task.durationMinutes / WORK_MINUTES));

    for (let i = 0; i < workBlocksForTask; i++) {
      sessionIndex += 1;
      workCount += 1;

      queue.push({
        userId: userId as unknown as IPomodoroSession["userId"],
        day,
        sessionIndex,
        type: "work",
        subjectId: task.subjectId as IPomodoroSession["subjectId"],
        topic: task.topic,
        planId: task._id as IPomodoroSession["planId"],
        durationMinutes: WORK_MINUTES,
        status: "pending",
        completedAt: null,
      });

      // A break follows every work block except the very last one overall.
      const isLastWorkBlockOfTask = i === workBlocksForTask - 1;
      const isLastTask = task === tasks[tasks.length - 1];
      if (!(isLastWorkBlockOfTask && isLastTask)) {
        sessionIndex += 1;
        const isLongBreak = workCount % SESSIONS_BEFORE_LONG_BREAK === 0;
        queue.push({
          userId: userId as unknown as IPomodoroSession["userId"],
          day,
          sessionIndex,
          type: isLongBreak ? "long_break" : "short_break",
          subjectId: null,
          topic: null,
          planId: null,
          durationMinutes: isLongBreak ? LONG_BREAK_MINUTES : SHORT_BREAK_MINUTES,
          status: "pending",
          completedAt: null,
        });
      }
    }
  }

  return queue;
}

const pomodoroService = {
  getTodaySessions: async (
    userId: string,
  ): Promise<{
    sessions: IPomodoroSession[];
    currentSessionIndex: number;
    completedWorkSessions: number;
    totalWorkSessions: number;
    totalMinutesToday: number;
  }> => {
    const day = formatDateISO(new Date());

    let sessions = await PomodoroSession.find({ userId, day })
      .populate("subjectId", "name icon")
      .sort({ sessionIndex: 1 });

    if (sessions.length === 0) {
      const tasks = await StudyPlan.find({ userId, day }).sort({ time: 1 });

      if (tasks.length > 0) {
        const draftQueue = buildQueueFromPlan(
          userId,
          day,
          tasks.map((t) => ({
            _id: t._id,
            subjectId: t.subjectId,
            topic: t.topic,
            durationMinutes: t.durationMinutes,
          })),
        );
        await PomodoroSession.insertMany(draftQueue);
        sessions = await PomodoroSession.find({ userId, day })
          .populate("subjectId", "name icon")
          .sort({ sessionIndex: 1 });
      }
    }

    const completedWork = sessions.filter((s) => s.type === "work" && s.status === "completed");
    const totalWork = sessions.filter((s) => s.type === "work");
    const firstPending = sessions.find((s) => s.status === "pending");

    return {
      sessions,
      currentSessionIndex: firstPending ? firstPending.sessionIndex : sessions.length,
      completedWorkSessions: completedWork.length,
      totalWorkSessions: totalWork.length,
      totalMinutesToday: completedWork.reduce((sum, s) => sum + s.durationMinutes, 0),
    };
  },

  completeSession: async (userId: string, sessionId: string): Promise<IPomodoroSession> => {
    const session = await PomodoroSession.findById(sessionId);
    if (!session) {
      throw new AppError("Pomodoro session not found", 404);
    }
    if (session.userId.toString() !== userId) {
      throw new AppError("User not authorized to update this session", 403);
    }
    if (session.status === "completed") {
      return session;
    }

    session.status = "completed";
    session.completedAt = new Date();
    await session.save();

    if (session.type === "work" && session.subjectId) {
      await progressService.logCompletedPomodoroWorkBlock(
        userId,
        session.subjectId.toString(),
        session.day,
        session.durationMinutes,
      );
    }

    return session;
  },

  resetToday: async (userId: string): Promise<void> => {
    const day = formatDateISO(new Date());
    await PomodoroSession.deleteMany({ userId, day, status: "pending" });
  },
};

export default pomodoroService;
