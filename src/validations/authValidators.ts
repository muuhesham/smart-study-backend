import { z } from "zod";

const authValidators = {
  register: z.object({
    body: z.object({
      name: z
        .string({ message: "Name is required" })
        .min(2, { message: "Name must be at least 2 characters long" })
        .max(50, { message: "Name must be at most 50 characters long" })
        .regex(/^[a-zA-Z0-9_ ]+$/, {
          message: "Name can only contain letters, numbers, and underscores",
        })
        .toLowerCase()
        .trim(),
      email: z.email({ message: "Invalid email address" }).toLowerCase().trim(),
      password: z
        .string({ message: "Password is required" })
        .regex(/^(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9\_\#\@\$\-]+$/, {
          message:
            "Password must contain at least 1 letter captial & 1 letter small",
        })
        .min(6, { message: "Password must be at least 6 characters long" })
        .max(50, { message: "Password must be at most 50 characters long" }),
      dailyStudyHours: z
        .number({
          message: "Study hours is required",
        })
        .min(1, { message: "Hours must be at least 1h" })
        .max(24, { message: "Study hours be must at most 24h" }),
    }),
  }),

  login: z.object({
    body: z.object({
      email: z.email({ message: "Invalid email address" }).toLowerCase(),
      password: z
        .string({ message: "Password is required" })
        .min(6, { message: "Password must be at least 6 characters long" }),
    }),
  }),
};

export default authValidators;
