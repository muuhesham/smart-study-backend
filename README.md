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
