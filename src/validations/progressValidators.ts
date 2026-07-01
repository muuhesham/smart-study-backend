import { z } from "zod";

const progressValidators = {
  updateProgress: z.object({
    body: z.object({
      subjectId: z
        .string({ message: "subjectId is required" })
        .min(1, { message: "subjectId is required" }),
      day: z.string({ message: "day is required" }).min(1, { message: "day is required" }),
      studyHours: z
        .number({ message: "studyHours is required" })
        .min(0, { message: "studyHours cannot be negative" })
        .max(24, { message: "studyHours must be at most 24" }),
      notes: z.string().max(1000).optional(),
    }),
  }),
};

export default progressValidators;
