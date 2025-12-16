import 'reflect-metadata';
import 'dotenv/config';

import { initializeNewRelic } from './config/newrelic';
initializeNewRelic();

import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { initializeDatabase } from './config/database';
import { initializeRedis, closeRedis } from './config/redis';
import { initializeRabbitMQ, closeRabbitMQ } from './config/rabbitmq';
import userRoutes from './routes/user.routes';
import logger from './utils/logger';

const app = express();
const PORT = process.env.PORT || 3002;

app.use(helmet());
app.use(cors());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later',
});
app.use(limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    service: 'user-service',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api', userRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.use((err: Error, req: Request, res: Response) => {
  logger.error('Unhandled error', { error: err });
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

const startServer = async () => {
  try {
    await initializeDatabase();
    await initializeRedis();
    await initializeRabbitMQ();

    app.listen(PORT, () => {
      logger.info(`🚀 User Service running on port ${PORT}`);
      logger.info(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
};

const shutdown = async () => {
  logger.info('Shutting down gracefully...');
  await closeRedis();
  await closeRabbitMQ();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

startServer();
