import env from "dotenv";

env.config();

export const DB_URL: string = process.env.DB_URL as string;
export const PORT: number = parseInt(process.env.PORT as string);
export const JWT_KEY: string = process.env.JWT_KEY as string;
