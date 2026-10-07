import mongoose from 'mongoose';
import { config } from './env.js';
import { logger } from '../lib/logger.js';

const MONGO_OPTIONS = {
  maxPoolSize: 50,
  minPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  autoIndex: config.NODE_ENV !== 'production'
};

export const connectDatabase = async () => {
  try {
    mongoose.connection.on('connecting', () => {
      logger.info('[DATABASE] Attempting connection to MongoDB...');
    });

    mongoose.connection.on('connected', () => {
      logger.info('[DATABASE] MongoDB connection established successfully.');
    });

    mongoose.connection.on('error', (err) => {
      logger.error({ err }, '[DATABASE] Runtime MongoDB connection error');
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('[DATABASE] MongoDB connection lost. Reconnecting...');
    });

    await mongoose.connect(config.MONGO_URI, MONGO_OPTIONS);
  } catch (error) {
    logger.fatal({ err: error }, '[DATABASE] Initial connection failed');
    process.exit(1);
  }
};

export const disconnectDatabase = async () => {
  try {
    await mongoose.connection.close(false);
    logger.info('[DATABASE] MongoDB connection closed cleanly.');
  } catch (error) {
    logger.error({ err: error }, '[DATABASE] Error while closing MongoDB connection');
  }
};