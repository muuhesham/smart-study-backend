import cors from "cors";
import { FRONTEND_URL } from "./env.js";

const corsOptions = {
  origin: FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

export { corsOptions, cors };
