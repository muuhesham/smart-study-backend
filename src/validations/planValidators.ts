import { z } from "zod";
import { studyPlanStatus } from "../constants/enums/studyPlanStatus.js";

const planValidators = {
  updateStatus: z.object({
    body: z.object({
      status: z.enum(Object.values(studyPlanStatus), {
        message: "status must be either 'pending' or 'done'",
      }),
    }),
  }),
};

export default planValidators;
