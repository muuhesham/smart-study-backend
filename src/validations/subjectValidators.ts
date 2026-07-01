import { z } from "zod";

const subjectValidators = {
  addSubject: z.object({
    body: z.object({
      name: z
        .string({ message: "Subject name is required" })
        .min(2, { message: "Subject name must be at least 2 characters long" })
        .max(100, { message: "Subject name must be at most 100 characters long" })
        .trim(),
      difficulty: z
        .number({ message: "Difficulty is required" })
        .min(1, { message: "Difficulty must be between 1 and 5" })
        .max(5, { message: "Difficulty must be between 1 and 5" }),
      examDate: z.coerce.date({ message: "A valid examDate is required" }),
      icon: z.string().max(10).trim().optional(),
      targetHoursPerWeek: z
        .number()
        .min(0, { message: "targetHoursPerWeek cannot be negative" })
        .max(40, { message: "targetHoursPerWeek must be at most 40" })
        .optional(),
      topics: z.array(z.string().trim().min(1)).max(50).optional(),
    }),
  }),

  updateSubject: z.object({
    body: z
      .object({
        name: z
          .string()
          .min(2, { message: "Subject name must be at least 2 characters long" })
          .max(100, { message: "Subject name must be at most 100 characters long" })
          .trim()
          .optional(),
        difficulty: z
          .number()
          .min(1, { message: "Difficulty must be between 1 and 5" })
          .max(5, { message: "Difficulty must be between 1 and 5" })
          .optional(),
        examDate: z.coerce.date({ message: "A valid examDate is required" }).optional(),
        icon: z.string().max(10).trim().optional(),
        targetHoursPerWeek: z
          .number()
          .min(0, { message: "targetHoursPerWeek cannot be negative" })
          .max(40, { message: "targetHoursPerWeek must be at most 40" })
          .optional(),
        topics: z.array(z.string().trim().min(1)).max(50).optional(),
      })
      .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field must be provided",
      }),
  }),
};

export default subjectValidators;
