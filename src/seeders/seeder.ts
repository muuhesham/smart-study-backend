import fs from "fs";
import path from "path";
import db from "../config/db.js";

import UserModel from "../models/User.js";
import SubjectModel from "../models/Subject.js";
import PomodoroSessionModel from "../models/PomodoroSession.js";
import ProgressModel from "../models/Progress.js";
import StudyPlanModel from "../models/StudyPlan.js";

const __dirname = import.meta.dirname;

const seedDB = async () => {
  try {
    await db.connectDB();
    console.log(`🌱 Starting seeding database...`);

    await UserModel.deleteMany({});
    await SubjectModel.deleteMany({});
    await StudyPlanModel.deleteMany({});
    await PomodoroSessionModel.deleteMany({});
    await ProgressModel.deleteMany({});

    const jsonPath = path.join(__dirname, "data.json");
    const rawData = fs.readFileSync(jsonPath, "utf-8");
    const parsedData = JSON.parse(rawData);

    await UserModel.insertMany(parsedData.users);
    console.log("👤 Users seeded.");

    await SubjectModel.insertMany(parsedData.subjects);
    console.log("📚 Subjects seeded.");

    await StudyPlanModel.insertMany(parsedData.studyPlans);
    console.log("📅 Study Plans seeded.");

    await PomodoroSessionModel.insertMany(parsedData.pomodoroSessions);
    console.log("⏱️ Pomodoro Sessions seeded.");

    await ProgressModel.insertMany(parsedData.progress);
    console.log("📈 Progress entries seeded.");

    console.log(`✨ Finishing seeding database!`);
    await db.disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error("❌ [ERROR] Seeding failed:", err);
    process.exit(1);
  }
};

seedDB();
