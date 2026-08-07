import { beforeEach, describe, expect, it, vi } from "vitest";
import reminderService from "../../src/services/reminderService";
import Subject from "../../src/models/Subject";
import StudyPlan from "../../src/models/StudyPlan";

vi.mock("../../src/models/Subject");
vi.mock("../../src/models/StudyPlan");

describe("Reminder Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("returns the same reminder shape for exams and today's plan", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-07T10:00:00.000Z"));

    vi.mocked(Subject.find).mockReturnValue({
      sort: vi.fn().mockResolvedValue([
        {
          _id: "subject-1",
          name: "Math",
          examDate: new Date("2026-08-09T00:00:00.000Z"),
        },
      ]),
    } as any);

    vi.mocked(StudyPlan.find).mockReturnValue({
      populate: vi.fn().mockReturnThis(),
      sort: vi.fn().mockResolvedValue([
        {
          topic: "Algebra",
          durationMinutes: 60,
          time: "09:00",
          subjectId: { _id: "subject-1", name: "Math" },
        },
      ]),
    } as any);

    const result = await reminderService.getReminders("user-1", 3);

    expect(result.examReminders).toHaveLength(1);
    expect(result.examReminders[0]).toMatchObject({
      type: "exam",
      name: "Math",
      daysRemaining: 2,
    });

    expect(result.studyReminders).toHaveLength(1);
    expect(result.studyReminders[0]).toMatchObject({
      type: "study_task",
      name: "Math",
      topic: "Algebra",
      plannedMinutes: 60,
    });
  });
});
