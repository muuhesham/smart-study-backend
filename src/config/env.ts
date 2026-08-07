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

function optionalEnv(name: string): string | undefined {
  return process.env[name];
}

export const DB_URL: string = requireEnv("DB_URL");
export const PORT: number = requireEnv("PORT")
  ? parseInt(requireEnv("PORT"), 10)
  : 3000;
export const JWT_KEY: string = requireEnv("JWT_KEY");
export const FRONTEND_URL: string = requireEnv("FRONTEND_URL");
export const EMAIL_HOST: string | undefined = optionalEnv("EMAIL_HOST");
export const EMAIL_PORT: number | undefined = optionalEnv("EMAIL_PORT")
  ? parseInt(optionalEnv("EMAIL_PORT") as string, 10)
  : undefined;
export const EMAIL_USER: string | undefined = optionalEnv("EMAIL_USER");
export const EMAIL_PASS: string | undefined = optionalEnv("EMAIL_PASS");
export const EMAIL_FROM: string | undefined = optionalEnv("EMAIL_FROM");
