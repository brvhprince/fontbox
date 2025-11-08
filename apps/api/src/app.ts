import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env.js';
import { router } from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authRateLimiter, uploadRateLimiter } from './middleware/rateLimiters.js';

export const app = express();

app.set('trust proxy', true);
app.use(helmet());
app.use(
  cors({
    origin: env.WEB_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('combined'));

app.use('/api/auth', authRateLimiter);
app.use('/api/fonts/upload', uploadRateLimiter);

app.use('/api', router);

app.use(errorHandler);
