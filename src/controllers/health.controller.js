import mongoose from 'mongoose';
import { ApiResponse } from '../utils/apiResponse.js';
import { HttpStatus } from '../constants/httpStatusCodes.js';

export const getLiveness = (_req, res) => {
  const healthData = {
    status: 'UP',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  };

  return ApiResponse.success(res, HttpStatus.OK, 'Service is alive', healthData);
};

export const getReadiness = (_req, res) => {
  // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const isDbReady = mongoose.connection.readyState === 1;

  const readinessData = {
    status: isDbReady ? 'READY' : 'NOT_READY',
    checks: {
      server: 'UP',
      database: isDbReady ? 'CONNECTED' : 'DISCONNECTED'
    },
    timestamp: new Date().toISOString()
  };

  if (!isDbReady) {
    return ApiResponse.error(
      res,
      HttpStatus.SERVICE_UNAVAILABLE,
      'Service dependencies are not ready',
      'SERVICE_UNAVAILABLE',
      readinessData
    );
  }

  return ApiResponse.success(res, HttpStatus.OK, 'Service is ready', readinessData);
};