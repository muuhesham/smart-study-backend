import Subject from "../models/Subject.js";
import StudyPlan from "../models/StudyPlan.js";
import { formatDateISO, startOfDay } from "../utils/date.js";
import { studyPlanStatus } from "../constants/enums/studyPlanStatus.js";

interface ExamReminder {
  type: "exam";
  subjectId: unknown;
  name: string;
  examDate: Date;
  daysRemaining: number;
  message: string;
}

interface StudyTaskReminder {
  type: "study_task";
  subjectId: unknown;
  name: string;
  topic: string;
  time: string;
  plannedMinutes: number;
  message: string;
}

function buildExamReminder(subject: any, today: Date): ExamReminder {
  const daysRemaining = Math.max(
    0,
    Math.round(
      (subject.examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    ),
  );

  return {
    type: "exam",
    subjectId: subject._id,
    name: subject.name,
    examDate: subject.examDate,
    daysRemaining,
    message:
      daysRemaining === 0
        ? `Your exam for "${subject.name}" is today!`
        : `Your exam for "${subject.name}" is in ${daysRemaining} day(s)`,
  };
}

function buildStudyReminder(task: any): StudyTaskReminder | null {
  if (!task.subjectId) {
    return null;
  }

  const subject = task.subjectId as { _id: unknown; name: string };

  return {
    type: "study_task",
    subjectId: subject._id,
    name: subject.name,
    topic: task.topic,
    time: task.time,
    plannedMinutes: task.durationMinutes,
    message: `You still have "${task.topic}" (${subject.name}, ${task.durationMinutes} min) planned for today at ${task.time}`,
  };
}

const reminderService = {
  getReminders: async (
    userId: string,
    withinDays: number = 3,
  ): Promise<{
    examReminders: ExamReminder[];
    studyReminders: StudyTaskReminder[];
  }> => {
    const today = startOfDay(new Date());
    const todayKey = formatDateISO(today);
    const horizon = new Date(
      today.getTime() + withinDays * 24 * 60 * 60 * 1000,
    );

    const upcomingSubjects = await Subject.find({
      userId,
      examDate: { $gte: today, $lte: horizon },
    }).sort({ examDate: 1 });

    const examReminders = upcomingSubjects.map((subject) =>
      buildExamReminder(subject, today),
    );

    const todaysPlan = await StudyPlan.find({
      userId,
      day: todayKey,
      status: studyPlanStatus.PENDING,
    })
      .populate("subjectId", "name")
      .sort({ time: 1 });

    const studyReminders = todaysPlan
      .map(buildStudyReminder)
      .filter((reminder): reminder is StudyTaskReminder => reminder !== null);

    return { examReminders, studyReminders };
  },
};

export default reminderService;
