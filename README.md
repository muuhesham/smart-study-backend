# Smart Study Planner Backend

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-blue?style=for-the-badge)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

This is the backend service for the SmartStudy application, built with Node.js, Express, TypeScript, and MongoDB.


## Prerequisites

- Node.js (v20 or higher recommended)
- MongoDB (local installation or connection string)
- npm or yarn

## Local Setup (No Docker)

1. **Navigate to the backend directory:**
   ```bash
   cd smart-study-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   - Copy the example environment file:
     ```bash
     cp .env.example .env
     ```
   - Open the `.env` file and set the following variables:
     - `PORT`: The port for the server (e.g., `8000`)
     - `DB_URL`: Your MongoDB connection string (e.g., `mongodb://localhost:27017/smart-study-db`)
     - `JWT_KEY`: A secure secret key for JSON Web Tokens
     - `FRONT_URL`: The URL of your frontend application (e.g., `http://localhost:5173`)

4. **Run the server:**
   - To run in development mode (with auto-reload):
     ```bash
     npm run dev
     ```
   - To build and start for production:
     ```bash
     npm run build
     npm start
     ```

## Configuration Enviorment

| Variable | Description | Example |
| :--- | :--- | :--- |
| `PORT` | Server port | `8000` |
| `DB_URL` | MongoDB Connection String | `mongodb://localhost:27017/smart-study` |
| `JWT_KEY` | Secret for token generation | `your-secure-random-string` |
| `FRONT_URL` | Frontend application URL | `http://localhost:5173` |

## Database Schema

| Collection | Fields |
| :--- | :--- |
| **Users** | `_id`, `name`, `email`, `password`, `dailyStudyHours` |
| **Subjects** | `_id`, `userId`, `name`, `difficulty` (1-5), `examDate`, `icon`, `targetHoursPerWeek`, `topics[]` |
| **StudyPlans** | `_id`, `userId`, `subjectId`, `day` (ISO date), `time` ("HH:mm"), `topic`, `durationMinutes`, `status` ("pending" \| "done") |
| **Progress** | `_id`, `userId`, `subjectId`, `day`, `studyHours`, `notes`, `pomodorosCompleted` |
| **PomodoroSessions** | `_id`, `userId`, `day`, `sessionIndex`, `type` ("work" \| "short_break" \| "long_break"), `subjectId`, `topic`, `planId`, `durationMinutes`, `status`, `completedAt` |

All endpoints below (except `/api/register` and `/api/login`) require an `Authorization: Bearer <token>` header.

## API Documentation

You can explore and test the API endpoints using the official Postman collection:
👉 [Smart Study Planner Postman Collection](https://www.postman.com/crimson-desert-397910/smart-study-planner/overview?sideView=agentMode)

## API Endpoints


### Auth
- `POST /api/register` — `{ name, email, password, dailyStudyHours }`
- `POST /api/login` — `{ email, password }`
- `POST /api/forgot-password` — `{ name, email, newPassword }`
- `POST /api/logout` — Logs out the user.

### Profile
- `GET /api/profile/me` — Returns current user profile.
- `PUT /api/profile/update-name` — `{ name }`
- `PUT /api/profile/change-password` — `{ currentPassword, newPassword }`
- `PUT /api/profile/update-email` — `{ newEmail }`
- `PUT /api/profile/update-daily-hours` — `{ newDailyHours }`
- `DELETE /api/profile` — Deletes the user account.

### Subjects
- `GET /api/subject` — List all subjects.
- `POST /api/subject` — `{ name, difficulty (1-5), examDate, icon?, targetHoursPerHweek?, topics? }`
- `PATCH /api/subject/:id` — Update any of `{ name, difficulty, examDate, icon, targetHoursPerWeek, topics }`
- `DELETE /api/subject/:id` — Remove a subject.

### Study Plan
- `GET /api/plan` — Returns current study plan.
- `POST /api/plan/generate` — Generates a plan starting tomorrow and covering the next 7 days. Urgency increases based on proximity to `examDate`.
- `PATCH /api/plan/:id/status` — `{ status: "pending" | "done" }`. Updating to "done" logs progress automatically.

### Dashboard
- `GET /api/dashboard` — Returns all stats: study hours (this week/delta), subjects count, exams this week, task completion %, and today's plan.
- `GET /api/reminders` — Upcoming exams and pending tasks.

### Progress
- `GET /api/progress` — Returns study history.
- `POST /api/progress` — `{ subjectId, day, studyHours, notes? }` for manual logging.

### Pomodoro
- `GET /api/pomodoro/today` — Generates a queue of Pomodoro sessions based on today's Study Plan.
- `POST /api/pomodoro/sessions/:id/complete` — Marks session as completed. Work sessions update Progress.
- `POST /api/pomodoro/today/reset` — Resets today's queue.


