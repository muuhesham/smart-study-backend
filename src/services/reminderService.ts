import Subject from "../models/Subject.js";
import StudyPlan from "../models/StudyPlan.js";
import { formatDateISO, startOfDay } from "../utils/date.js";

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

const reminderService = {
  getReminders: async (
    userId: string,
    withinDays: number = 3,
  ): Promise<{ examReminders: ExamReminder[]; studyReminders: StudyTaskReminder[] }> => {
    const today = startOfDay(new Date());
    const todayKey = formatDateISO(today);
    const horizon = new Date(today.getTime() + withinDays * 24 * 60 * 60 * 1000);

    const upcomingSubjects = await Subject.find({
      userId,
      examDate: { $gte: today, $lte: horizon },
    }).sort({ examDate: 1 });

    const examReminders: ExamReminder[] = upcomingSubjects.map((s) => {
      const daysRemaining = Math.max(
        0,
        Math.round((s.examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
      );
      return {
        type: "exam",
        subjectId: s._id,
        name: s.name,
        examDate: s.examDate,
        daysRemaining,
        message:
          daysRemaining === 0
            ? `Your exam for "${s.name}" is today!`
            : `Your exam for "${s.name}" is in ${daysRemaining} day(s)`,
      };
    });

    const todaysPlan = await StudyPlan.find({ userId, day: todayKey, status: "pending" })
      .populate("subjectId", "name")
      .sort({ time: 1 });

    const studyReminders: StudyTaskReminder[] = todaysPlan
      .filter((task) => task.subjectId !== null)
      .map((task) => {
        const populated = task.subjectId as unknown as { _id: unknown; name: string };
        return {
          type: "study_task",
          subjectId: populated._id,
          name: populated.name,
          topic: task.topic,
          time: task.time,
          plannedMinutes: task.durationMinutes,
          message: `You still have "${task.topic}" (${populated.name}, ${task.durationMinutes} min) planned for today at ${task.time}`,
        };
      });

    return { examReminders, studyReminders };
  },
};

export default reminderService;
