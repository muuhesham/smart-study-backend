import express from 'express';
import { cors, corsOptions } from './config/cors.js';
import loggers from './config/logger.js';
import helmet from 'helmet';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import subjectRoutes from './routes/subjectRoutes.js';
import planRoutes from './routes/planRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import pomodoroRoutes from './routes/pomodoroRoutes.js';
import errorHandler from './middlewares/errorHandler.js';
import { AppError } from './utils/AppError.js';

const app = express();

app.use(cors(corsOptions));
app.use(loggers);
app.use(helmet());
app.use(express.json());

app.use('/api', authRoutes);
app.use('/api', dashboardRoutes);
app.use("/api/profile", userRoutes);
app.use('/api/subject', subjectRoutes);
app.use('/api/plan', planRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/pomodoro', pomodoroRoutes);

app.use((req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
});

app.use(errorHandler);

export default app;