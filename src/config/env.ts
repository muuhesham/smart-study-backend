import env from "dotenv";

env.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Did you copy .env.example to .env and fill it in?`,
    );
  }
  return value;
}

export const DB_URL: string = requireEnv("DB_URL");
export const PORT: number = requireEnv("PORT") ? parseInt(requireEnv("PORT"), 10) : 3000;
export const JWT_KEY: string = requireEnv("JWT_KEY");
export const FRONTEND_URL: string = requireEnv("FRONTEND_URL");
