import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import { validate } from '../../src/middlewares/validate.middleware.js';
import { ErrorCode } from '../../src/constants/errorCodes.js';

describe('Validate Middleware Unit Tests', () => {
  const dummySchema = {
    body: z.object({
      email: z.string().email(),
      age: z.number().min(18)
    })
  };

  it('should call next() without error if payload satisfies schema', async () => {
    const req = {
      body: { email: 'valid@example.com', age: 25 }
    };
    const res = {};
    const next = vi.fn();

    const middleware = validate(dummySchema);
    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('should call next(AppError) with VALIDATION_ERROR if payload is invalid', async () => {
    const req = {
      body: { email: 'not-an-email', age: 16 }
    };
    const res = {};
    const next = vi.fn();

    const middleware = validate(dummySchema);
    await middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const thrownError = next.mock.calls[0][0];

    expect(thrownError.statusCode).toBe(400);
    expect(thrownError.errorCode).toBe(ErrorCode.VALIDATION_ERROR);
    expect(thrownError.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'email' }),
        expect.objectContaining({ field: 'age' })
      ])
    );
  });
});