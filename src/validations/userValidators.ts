import { z } from "zod";

const userValidators = {
  updateUsername: z.object({
    body: z.object({
      name: z
        .string({ message: "Name is required" })
        .min(2, { message: "Name must be at least 2 characters long" })
        .max(50, { message: "Name must be at most 50 characters long" })
        .regex(/^[a-zA-Z0-9_ ]+$/, {
          message:
            "Name can only contain letters, numbers, and underscores",
        })
        .toLowerCase()
        .trim(),
    }),
  }),

  changePassword: z.object({
    body: z.object({
      currentPassword: z
        .string({ message: "Current password is required" })
        .min(6, {
          message: "Current password must be at least 6 characters",
        }),
      newPassword: z
        .string({ message: "New password is required" })
        .regex(/^(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9\_\#\@\$\-]+$/, {
          message:
            "Password must contain at least 1 letter captial & 1 letter small",
        })
        .min(6, { message: "New password must be at least 6 characters" })
        .max(50, { message: "Password must be at most 50 characters" }),
    }),
  }),
};

export default userValidators;
