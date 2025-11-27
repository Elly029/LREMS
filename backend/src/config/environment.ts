import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config();

export const config = {
  // Server Configuration
  port: parseInt(process.env.PORT || '3000'),
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database Configuration
  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'book_management',
    user: process.env.DB_USER || 'book_user',
    password: process.env.DB_PASSWORD || 'book_password',
    poolMin: parseInt(process.env.DB_POOL_MIN || '2'),
    poolMax: parseInt(process.env.DB_POOL_MAX || '10'),
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secure-jwt-secret-key-change-in-production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-super-secure-refresh-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // Security Configuration
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log',
  },

  // Feature Flags
  features: {
    enableAuth: process.env.ENABLE_AUTH !== 'false',
    enableAudit: process.env.ENABLE_AUDIT !== 'false',
    enableCache: process.env.ENABLE_CACHE === 'true',
  },
};

export default config;