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

// CORS configuration - Move to top
const allowedOrigins = [
  config.corsOrigin,
  'https://lrems.up.railway.app',
  'http://localhost:5173',
  'http://localhost:4173'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    console.log('CORS check for origin:', origin);
    console.log('Allowed origins:', allowedOrigins);

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      console.log('Origin allowed');
      callback(null, true);
    } else {
      // For development, you might want to be more permissive
      // But in production, be strict
      if (config.nodeEnv === 'development') {
        console.warn(`CORS allowed in development for origin: ${origin}`);
        callback(null, true);
      } else {
        console.warn(`CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));

// Handle preflight requests explicitly
app.options('*', (req, res) => {
  const origin = req.get('Origin');

  console.log('Preflight request received from origin:', origin);
  console.log('Allowed origins:', allowedOrigins);

  // Set CORS headers for preflight requests
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    console.log('Setting CORS header for allowed origin:', origin);
  } else if (!origin) {
    // For requests with no origin, allow all
    res.header('Access-Control-Allow-Origin', '*');
    console.log('Setting CORS header for no origin');
  } else {
    console.log('Origin not allowed:', origin);
    // In development, be more permissive
    if (config.nodeEnv === 'development') {
      res.header('Access-Control-Allow-Origin', origin);
      console.log('Allowing origin in development mode:', origin);
    } else {
      res.header('Access-Control-Allow-Origin', 'null');
    }
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours

  console.log('Sending preflight response with headers:', res.getHeaders());
  res.sendStatus(200);
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", config.corsOrigin], // Allow connection to backend
    },
  },
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

// 404 handler
app.use('*', notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;