import express from 'express';
import { cors, corsOptions } from './config/cors.js';
import morgan from 'morgan';
import helmet from 'helmet';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();

app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(helmet());
app.use(express.json());

app.use('/api', authRoutes);
app.use('/api', userRoutes);

app.use(errorHandler);

export default app;