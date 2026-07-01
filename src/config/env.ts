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
export const PORT: number = parseInt(process.env.PORT ?? "8000", 10);
export const JWT_KEY: string = requireEnv("JWT_KEY");
