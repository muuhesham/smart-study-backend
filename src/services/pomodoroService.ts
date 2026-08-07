import PomodoroSession, {
  IPomodoroSession,
} from "../models/PomodoroSession.js";
import StudyPlan from "../models/StudyPlan.js";
import { AppError } from "../utils/AppError.js";
import { formatDateISO } from "../utils/date.js";
import { DEFAULT_POMODORO_CONFIG } from "../utils/pomodoro.js";
import progressService from "./progressService.js";
import { pomodoroTypes } from "../constants/enums/pomodoroTypes.js";
import { pomodoroStatus } from "../constants/enums/pomodoroStatus.js";

const WORK_MINUTES = DEFAULT_POMODORO_CONFIG.workMinutes;
const SHORT_BREAK_MINUTES = DEFAULT_POMODORO_CONFIG.shortBreakMinutes;
const LONG_BREAK_MINUTES = DEFAULT_POMODORO_CONFIG.longBreakMinutes;
const SESSIONS_BEFORE_LONG_BREAK =
  DEFAULT_POMODORO_CONFIG.sessionsBeforeLongBreak;

function createWorkSession(
  userId: string,
  day: string,
  sessionIndex: number,
  task: {
    _id: unknown;
    subjectId: unknown;
    topic: string;
    durationMinutes: number;
  },
): Partial<IPomodoroSession> {
  return {
    userId: userId as unknown as IPomodoroSession["userId"],
    day,
    sessionIndex,
    type: pomodoroTypes.WORK,
    subjectId: task.subjectId as IPomodoroSession["subjectId"],
    topic: task.topic,
    planId: task._id as IPomodoroSession["planId"],
    durationMinutes: WORK_MINUTES,
    status: pomodoroStatus.PENDING,
    completedAt: null,
  };
}

function createBreakSession(
  userId: string,
  day: string,
  sessionIndex: number,
  workCount: number,
): Partial<IPomodoroSession> {
  const isLongBreak = workCount % SESSIONS_BEFORE_LONG_BREAK === 0;

  return {
    userId: userId as unknown as IPomodoroSession["userId"],
    day,
    sessionIndex,
    type: isLongBreak ? pomodoroTypes.LONG_BREAK : pomodoroTypes.SHORT_BREAK,
    subjectId: null,
    topic: null,
    planId: null,
    durationMinutes: isLongBreak ? LONG_BREAK_MINUTES : SHORT_BREAK_MINUTES,
    status: pomodoroStatus.PENDING,
    completedAt: null,
  };
}

function buildQueueFromPlan(
  userId: string,
  day: string,
  tasks: {
    _id: unknown;
    subjectId: unknown;
    topic: string;
    durationMinutes: number;
  }[],
): Partial<IPomodoroSession>[] {
  const queue: Partial<IPomodoroSession>[] = [];
  let workCount = 0;
  let sessionIndex = 0;

  for (let taskIndex = 0; taskIndex < tasks.length; taskIndex++) {
    const task = tasks[taskIndex];
    const workBlocksForTask = Math.max(
      1,
      Math.ceil(task.durationMinutes / WORK_MINUTES),
    );

    for (let blockIndex = 0; blockIndex < workBlocksForTask; blockIndex++) {
      sessionIndex += 1;
      workCount += 1;
      queue.push(createWorkSession(userId, day, sessionIndex, task));

      const isLastWorkBlockOfTask = blockIndex === workBlocksForTask - 1;
      const isLastTask = taskIndex === tasks.length - 1;
      if (!(isLastWorkBlockOfTask && isLastTask)) {
        sessionIndex += 1;
        queue.push(createBreakSession(userId, day, sessionIndex, workCount));
      }
    }
  }

  return queue;
}

async function getSessionsForDay(
  userId: string,
  day: string,
): Promise<IPomodoroSession[]> {
  const sessions = await PomodoroSession.find({ userId, day })
    .populate("subjectId", "name icon")
    .sort({ sessionIndex: 1 });

  return sessions as unknown as IPomodoroSession[];
}

async function createTodaySessions(
  userId: string,
  day: string,
): Promise<IPomodoroSession[]> {
  const tasks = await StudyPlan.find({ userId, day }).sort({ time: 1 });
  if (tasks.length === 0) {
    return [];
  }

  const queue = buildQueueFromPlan(
    userId,
    day,
    tasks.map((task) => ({
      _id: task._id,
      subjectId: task.subjectId,
      topic: task.topic,
      durationMinutes: task.durationMinutes,
    })),
  );

  await PomodoroSession.insertMany(queue);
  return getSessionsForDay(userId, day);
}

function calculatePomodoroStats(sessions: IPomodoroSession[]) {
  let completedWorkSessions = 0;
  let totalWorkSessions = 0;
  let totalMinutesToday = 0;
  let currentSessionIndex = sessions.length;

  for (const session of sessions) {
    const isWork = session.type === pomodoroTypes.WORK;
    if (isWork) {
      totalWorkSessions += 1;
      if (session.status === pomodoroStatus.COMPLETED) {
        completedWorkSessions += 1;
        totalMinutesToday += session.durationMinutes;
      }
    }
    if (
      currentSessionIndex === sessions.length &&
      session.status === pomodoroStatus.PENDING
    ) {
      currentSessionIndex = session.sessionIndex;
    }
  }

  return {
    currentSessionIndex,
    completedWorkSessions,
    totalWorkSessions,
    totalMinutesToday,
  };
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
    let sessions = await getSessionsForDay(userId, day);

    if (sessions.length === 0) {
      sessions = await createTodaySessions(userId, day);
    }

    return {
      sessions,
      ...calculatePomodoroStats(sessions),
    };
  },

  completeSession: async (
    userId: string,
    sessionId: string,
  ): Promise<IPomodoroSession> => {
    if (!sessionId) {
      throw new AppError("Session ID is required", 400);
    }

    const session = await PomodoroSession.findOne({ _id: sessionId, userId });
    if (!session) {
      throw new AppError("Pomodoro session not found or unauthorized", 404);
    }

    if (session.status === pomodoroStatus.COMPLETED) {
      return session;
    }

    session.status = pomodoroStatus.COMPLETED;
    session.completedAt = new Date();
    await session.save();

    if (session.type === pomodoroTypes.WORK && session.subjectId) {
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
    await PomodoroSession.deleteMany({
      userId,
      day,
      status: pomodoroStatus.PENDING,
    });
  },
};

export default pomodoroService;
