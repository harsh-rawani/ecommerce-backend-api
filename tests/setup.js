import mongoose from 'mongoose';
import { beforeAll, afterEach, afterAll } from 'vitest';
import { config } from '../src/config/env.js';

beforeAll(async () => {
  // Use a dedicated test database namespace
  const testUri = config.MONGO_URI.replace(/\/ecommerce_prod(\?|$)/, '/ecommerce_test$1');
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(testUri);
  }
});

afterEach(async () => {
  // Clean all collections between test cases to ensure idempotency
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
});