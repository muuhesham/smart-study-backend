import { beforeEach, describe, expect, it, vi } from "vitest";
import planService from "../../src/services/planService";
import User from "../../src/models/User";
import Subject from "../../src/models/Subject";
import StudyPlan from "../../src/models/StudyPlan";
import { dashboardCache } from "../../src/utils/cache";

vi.mock("../../src/models/User");
vi.mock("../../src/models/Subject");
vi.mock("../../src/models/StudyPlan");
vi.mock("../../src/utils/cache", () => ({
  dashboardCache: {
    delete: vi.fn(),
  },
}));
vi.mock("../../src/services/progressService", () => ({
  default: {
    adjustStudyHours: vi.fn(),
  },
}));

describe("Plan Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("starts generated plan entries on the generation day", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-08T12:00:00.000Z"));

    vi.mocked(User.findById).mockResolvedValue({
      _id: "user-1",
      dailyStudyHours: 4,
    } as any);
    vi.mocked(Subject.find).mockResolvedValue([
      {
        _id: "subject-1",
        userId: "user-1",
        name: "Math",
        difficulty: 2,
        examDate: new Date("2026-08-20T00:00:00.000Z"),
        topics: ["Algebra"],
      },
    ] as any);
    vi.mocked(StudyPlan.deleteMany).mockResolvedValue({} as any);
    vi.mocked(StudyPlan.insertMany).mockResolvedValue([] as any);
    vi.mocked(StudyPlan.find).mockReturnValue({
      populate: vi.fn().mockReturnThis(),
      sort: vi.fn().mockResolvedValue([]),
    } as any);

    await planService.generatePlan("user-1");

    const insertedEntries = vi.mocked(StudyPlan.insertMany).mock
      .calls[0]?.[0] as Array<{
      day: string;
    }>;

    expect(insertedEntries[0]?.day).toBe("2026-08-08");
    expect(insertedEntries[0]?.day).not.toBe("2026-08-09");
    expect(dashboardCache.delete).toHaveBeenCalledWith("user-1");
  });
});
