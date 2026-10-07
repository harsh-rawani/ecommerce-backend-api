import { describe, it, expect, vi, afterEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app.js';

describe('Health & Readiness Endpoints Integration', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('GET /api/v1/health should return 200 with UP status', async () => {
    const res = await request(app).get('/api/v1/health');

    expect(res.status).toBe(200);
    expect(res.headers).toHaveProperty('x-request-id');
    expect(res.body.data.status).toBe('UP');
  });

  it('GET /api/v1/health/ready should return 200 when database is readyState === 1', async () => {
    Object.defineProperty(mongoose.connection, 'readyState', {
      value: 1,
      configurable: true,
      writable: true
    });

    const res = await request(app).get('/api/v1/health/ready');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('READY');
    expect(res.body.data.checks.database).toBe('CONNECTED');
  });

  it('GET /api/v1/health/ready should return 503 when database is disconnected', async () => {
    Object.defineProperty(mongoose.connection, 'readyState', {
      value: 0,
      configurable: true,
      writable: true
    });

    const res = await request(app).get('/api/v1/health/ready');

    expect(res.status).toBe(503);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('SERVICE_UNAVAILABLE');
    expect(res.body.error.details.checks.database).toBe('DISCONNECTED');
  });
});