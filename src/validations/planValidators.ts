import { z } from "zod";

const planValidators = {
  updateStatus: z.object({
    body: z.object({
      status: z.enum(["pending", "done"], {
        message: "status must be either 'pending' or 'done'",
      }),
    }),
  }),
};

export default planValidators;
