import mongoose from 'mongoose';
import { config } from './env.js';

let isConnected = false;

/**
 * Tekmira AI — Reusable MongoDB Connection Module (Mongoose)
 * 
 * Manages document database connection for unstructured analysis trees:
 * - Resume document extractions
 * - GitHub repository snapshot trees
 * - Gemini skill triangulation reports
 */
export async function connectMongo() {
  if (isConnected || mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const uri = config.mongodbUri;
  if (!uri) {
    console.warn('⚠️ MongoDB URI not configured. Document store will operate in offline mode.');
    return null;
  }

  try {
    // 5-second server selection timeout to avoid hanging if MongoDB is not running locally
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000
    });

    isConnected = true;
    console.log('🍃 MongoDB Connected Successfully (Mongoose ODM)');
    return mongoose.connection;
  } catch (error) {
    isConnected = false;
    // Log safe error message without exposing connection URI or credentials
    console.warn('⚠️ MongoDB Connection Notice: Database offline or unreachable on local port 27017.');
    return null;
  }
}

/**
 * Checks MongoDB database connectivity safely
 * Never exposes credentials or connection strings to callers or health logs
 * 
 * @returns {Promise<{ status: string, connected: boolean, message: string }>}
 */
export async function checkMongoHealth() {
  const readyState = mongoose.connection.readyState;
  
  // Mongoose readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  if (readyState === 1) {
    return {
      status: 'connected',
      connected: true,
      message: 'MongoDB document store healthy'
    };
  }

  if (readyState === 2) {
    return {
      status: 'connecting',
      connected: false,
      message: 'MongoDB connection in progress'
    };
  }

  return {
    status: 'disconnected',
    connected: false,
    message: 'MongoDB document store unavailable'
  };
}

/**
 * Gracefully disconnects Mongoose on process termination
 */
export async function disconnectMongo() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
  }
}

// Connection event listeners for resilience
mongoose.connection.on('error', () => {
  isConnected = false;
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
});

export default { connectMongo, checkMongoHealth, disconnectMongo };
