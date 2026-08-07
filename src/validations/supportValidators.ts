import { z } from "zod";

const supportValidators = {
  report: z.object({
    body: z.object({
      name: z
        .string({ message: "Name is required" })
        .min(2, { message: "Name must be at least 2 characters long" })
        .max(50, { message: "Name must be at most 50 characters long" })
        .trim(),
      email: z
        .string()
        .email({ message: "Invalid email address" })
        .toLowerCase()
        .trim(),
      messageType: z
        .string({ message: "Message type is required" })
        .min(1, { message: "Message type is required" }),
      message: z
        .string({ message: "Message is required" })
        .min(10, { message: "Message must be at least 10 characters long" })
        .max(1000, { message: "Message must be at most 1000 characters long" }),
    }),
  }),
};

export default supportValidators;
