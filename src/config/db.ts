import mongoose from "mongoose";
import { DB_URL } from "./env.js";

const connectDB = async () => {
  try {
    await mongoose.connect(DB_URL);
    console.log("✅ DB CONNECTED SUCCESSFULLY");
  } catch (err) {
    console.error("❌ Error connecting to DB:", err);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ Error disconnecting to DB:", err);
    process.exit(1);
  }
};

export default { connectDB, disconnectDB };
