import { Cart } from '../models/cart.model.js';

export class CartRepository {
  static async findByUserId(userId) {
    return Cart.findOne({ user: userId });
  }

  static async findByUserIdPopulated(userId) {
    return Cart.findOne({ user: userId }).populate({
      path: 'items.product',
      select: 'name slug price discountPrice stock isAvailable images'
    });
  }

  static async createCart(userId) {
    return Cart.create({ user: userId, items: [], subtotal: 0, totalItems: 0 });
  }

  static async clearCart(userId) {
    return Cart.findOneAndUpdate(
      { user: userId },
      { $set: { items: [], subtotal: 0, totalItems: 0 } },
      { new: true }
    );
  }
}