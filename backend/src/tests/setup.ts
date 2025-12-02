import dotenv from 'dotenv';
import { connectDatabase, closeConnection } from '@/config/database';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';
process.env.ENABLE_AUTH = 'false';

beforeAll(async () => {
  await connectDatabase();
});

afterAll(async () => {
  await closeConnection();
});
