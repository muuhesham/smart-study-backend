# SmartStudy Backend

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

## Configuration Summary

| Variable | Description | Example |
| :--- | :--- | :--- |
| `PORT` | Server port | `8000` |
| `DB_URL` | MongoDB Connection String | `mongodb://localhost:27017/smart-study` |
| `JWT_KEY` | Secret for token generation | `your-secure-random-string` |

## Database Schema

| Collection | Fields |
| :--- | :--- |
| **Users** | `_id`, `name`, `email`, `password`, `dailyStudyHours` |
| **Subjects** | `_id`, `userId`, `name`, `difficulty` (1-5), `examDate`, `icon`, `targetHoursPerWeek`, `topics[]` |
| **StudyPlans** | `_id`, `userId`, `subjectId`, `day` (ISO date), `time` ("HH:mm"), `topic`, `durationMinutes`, `status` ("pending" \| "done") |
| **Progress** | `_id`, `userId`, `subjectId`, `day`, `studyHours`, `notes`, `pomodorosCompleted` |
| **PomodoroSessions** | `_id`, `userId`, `day`, `sessionIndex`, `type` ("work" \| "short_break" \| "long_break"), `subjectId`, `topic`, `planId`, `durationMinutes`, `status`, `completedAt` |

All endpoints below (except `/api/register` and `/api/login`) require an `Authorization: Bearer <token>` header.

## API Endpoints

### Auth
- `POST /api/register` — `{ name, email, password, dailyStudyHours }`
- `POST /api/login` — `{ email, password }`

### Profile
- `GET /api/profile`
- `PUT /api/profile` — `{ name }`
- `PUT /api/change-password` — `{ currentPassword, newPassword }`
- `DELETE /api/profile`

### Subjects
- `GET /api/subjects`
- `POST /api/subjects` — `{ name, difficulty (1-5), examDate, icon?, targetHoursPerWeek?, topics? }`
- `PUT /api/subjects/:id` — any of `{ name, difficulty, examDate, icon, targetHoursPerWeek, topics }`
- `DELETE /api/subjects/:id`

### Study Plan
- `GET /api/plan` — returns each session with `day`, `time`, `subjectId` (populated with `name`/`icon`), `topic`, `durationMinutes`, `status`
- `POST /api/plan/generate` — generates a plan starting **tomorrow** and covering the next 7 calendar days.
  Each day's sessions are recomputed per subject based on `difficulty` and how many days remain until that
  subject's `examDate` *as of that specific day* — urgency increases the closer the exam gets, and a subject
  stops being scheduled entirely once its exam date has passed. Each session gets a concrete `time` slot and
  a `topic` (cycled from the subject's `topics` list, or a generic fallback).
- `PATCH /api/plan/:id/status` — `{ status: "pending" | "done" }`. Marking a task "done" automatically logs
  its duration as study progress (kept in sync with the dashboard); reverting to "pending" reverses it.

### Dashboard
- `GET /api/dashboard` — all stats shown on the dashboard screen:
  `studyHoursThisWeek`, `studyHoursDeltaVsLastWeek`, `subjectsCount`, `examsThisWeek`, `tasksCompletedPercent`,
  `pomodorosToday`, `pomodoroGoalToday`, `weeklyStudyHours` (Mon–Sun chart data), `subjectProgress`
  (per-subject completion %), `todaysPlan`.

### Reminders
- `GET /api/reminders?withinDays=3` — upcoming exams within `withinDays` days, and today's planned study
  tasks that haven't been logged as progress yet.

### Progress
- `GET /api/progress`
- `POST /api/progress` — `{ subjectId, day, studyHours, notes? }` (manual logging)

### Pomodoro
- `GET /api/pomodoro/today` — today's Pomodoro session queue, generated automatically from today's Study
  Plan tasks (each task's duration split into 25-minute work blocks with short/long breaks between them,
  matching the classic Pomodoro cadence). Returns `sessions[]`, `currentSessionIndex`,
  `completedWorkSessions`, `totalWorkSessions`, `totalMinutesToday` — everything needed for the "Session 4
  of 8" / "Today's sessions" / "Total today" UI.
- `POST /api/pomodoro/sessions/:id/complete` — marks a session completed; completing a "work" block also
  logs its minutes + a Pomodoro count to Progress automatically.
- `POST /api/pomodoro/today/reset` — clears today's not-yet-completed queue so it's rebuilt from the latest
  Study Plan (useful after regenerating the plan).

This is the single Pomodoro implementation in the backend — the session queue above is the only place
Pomodoro sessions are generated, tracked, and completed; there is no separate/duplicate manual logging
endpoint under `/progress`.

