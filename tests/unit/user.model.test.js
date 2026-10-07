import { describe, it, expect } from 'vitest';
import bcrypt from 'bcryptjs';
import { User } from '../../src/models/user.model.js';

describe('User Model Unit Tests', () => {
  it('should hash the password before saving a new user', async () => {
    const rawPassword = 'SecurePassword123!';
    const user = await User.create({
      name: 'John Doe',
      email: `john.doe.${Date.now()}@example.com`,
      password: rawPassword
    });

    expect(user.password).not.toBe(rawPassword);
    const isMatch = await bcrypt.compare(rawPassword, user.password);
    expect(isMatch).toBe(true);
  });

  it('comparePassword method should return true for correct password and false for wrong password', async () => {
    const rawPassword = 'SecurePassword123!';
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const user = new User({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: hashedPassword
    });

    const isMatch = await user.comparePassword(rawPassword);
    const isWrongMatch = await user.comparePassword('WrongPassword123!');

    expect(isMatch).toBe(true);
    expect(isWrongMatch).toBe(false);
  });

  it('toJSON should strip password and __v from output', () => {
    const user = new User({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'someHashedPassword'
    });

    const json = user.toJSON();
    expect(json.password).toBeUndefined();
    expect(json.__v).toBeUndefined();
  });
});