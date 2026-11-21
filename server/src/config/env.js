import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve current directory for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const isProduction = process.env.NODE_ENV === 'production';
const jwtSecret = process.env.JWT_SECRET || 'tekmira_default_dev_secret_key_change_in_production';

if (isProduction && (!process.env.DATABASE_URL || jwtSecret.length < 32 || jwtSecret === 'tekmira_default_dev_secret_key_change_in_production')) {
  throw new Error('Production configuration requires DATABASE_URL and a unique JWT_SECRET of at least 32 characters.');
}

export const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  databaseUrl: process.env.DATABASE_URL || '',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/tekmira_docs',
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  githubToken: process.env.GITHUB_TOKEN || '',
  isProduction
};
