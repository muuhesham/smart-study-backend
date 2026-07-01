import express from 'express';
import { cors, corsOptions } from './config/cors.js';
import morgan from 'morgan';
import helmet from 'helmet';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import studyRoutes from './routes/studyRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import pomodoroRoutes from './routes/pomodoroRoutes.js';
import errorHandler from './middlewares/errorHandler.js';
import { AppError } from './utils/AppError.js';

const app = express();

app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(helmet());
app.use(express.json());

app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', studyRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', pomodoroRoutes);

app.use((req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
});

app.use(errorHandler);

export default app;