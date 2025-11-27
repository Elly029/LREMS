
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

// Configuration
import config from '@/config/environment';

// Middleware
import { errorHandler, notFoundHandler } from '@/middleware/errorHandler';
import logger from '@/utils/logger';

// Routes
import booksRouter from '@/routes/books';
import authRouter from '@/routes/auth';
import evaluatorsRouter from '@/routes/evaluators';
import evaluationMonitoringRouter from '@/routes/evaluationMonitoring';
import evaluatorDashboardRouter from '@/routes/evaluatorDashboard';

// Create Express application
const app: Application = express();

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many requests, please try again later',
      timestamp: new Date().toISOString(),
      path: '/api'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn('Rate limit exceeded', { ip: req.ip, path: req.path });
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many requests, please try again later',
        timestamp: new Date().toISOString(),
        path: req.path
      }
    });
  }
});

app.use('/api', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message: string) => {
        logger.info(message.trim());
      }
    }
  }));
}

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.debug(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    query: req.query
  });
  next();
});

// Health check endpoint
app.get('/health', async (req: Request, res: Response) => {
  const healthCheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
    version: '1.0.0',
    checks: {
      server: 'OK'
    }
  };

  try {
    // You can add more health checks here (database, external services, etc.)
    res.json(healthCheck);
  } catch (error) {
    logger.error('Health check failed', error);
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      checks: {
        server: 'ERROR'
      }
    });
  }
});

// API routes
app.use('/api/auth', authRouter);
app.use('/api/books', booksRouter);
app.use('/api/evaluators', evaluatorsRouter);
app.use('/api/monitoring', evaluationMonitoringRouter);
app.use('/api/evaluator-dashboard', evaluatorDashboardRouter);

// Serve static files in production
if (config.nodeEnv === 'production') {
  const path = require('path');
  // Serve static files from the React app
  app.use(express.static(path.join(__dirname, '../../dist')));

  // The "catchall" handler: for any request that doesn't
  // match one above, send back React's index.html file.
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../../dist/index.html'));
  });
} else {
  // 404 handler for development (or if not serving static)
  app.use('*', notFoundHandler);
}

// Global error handler
app.use(errorHandler);

export default app;