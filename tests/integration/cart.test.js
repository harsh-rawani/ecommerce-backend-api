import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import { Product } from '../../src/models/product.model.js';

describe('Cart Integration Tests', () => {
  const setupTestContext = async () => {
    // 1. Create dedicated user
    const email = `cart.${Date.now()}.${Math.random().toString(36).substring(7)}@example.com`;
    const authRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Cart Tester',
        email,
        password: 'Password123!'
      });

    const userToken = authRes.body.data.accessToken;

    // 2. Create dedicated product
    const product = await Product.create({
      name: `Mechanical Keyboard ${Date.now()}`,
      slug: `keyboard-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      description: 'Tactile mechanical switches with RGB lighting',
      price: 8999,
      discountPrice: 7999,
      category: 'accessories',
      brand: 'Keychron',
      stock: 10,
      images: ['https://example.com/keyboard.jpg']
    });

    return { userToken, product };
  };

  it('POST /api/v1/cart/items should add an item and calculate totals correctly', async () => {
    const { userToken, product } = await setupTestContext();

    const res = await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        productId: product._id.toString(),
        quantity: 2
      });

    expect(res.status).toBe(200);
    expect(res.body.data.totalItems).toBe(2);
    expect(res.body.data.subtotal).toBe(15998); // 7999 * 2
    expect(res.body.data.items).toHaveLength(1);
  });

  it('POST /api/v1/cart/items should reject quantity exceeding available stock', async () => {
    const { userToken, product } = await setupTestContext();

    const res = await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        productId: product._id.toString(),
        quantity: 50 // Stock is only 10
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('DELETE /api/v1/cart/items/:itemId should remove product and reset totals', async () => {
    const { userToken, product } = await setupTestContext();

    // Add item first
    const addRes = await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        productId: product._id.toString(),
        quantity: 1
      });

    const itemId = addRes.body.data.items[0]._id;

    // Delete item
    const deleteRes = await request(app)
      .delete(`/api/v1/cart/items/${itemId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.data.items).toHaveLength(0);
    expect(deleteRes.body.data.subtotal).toBe(0);
    expect(deleteRes.body.data.totalItems).toBe(0);
  });
});