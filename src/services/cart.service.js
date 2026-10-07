import { CartRepository } from '../repositories/cart.repository.js';
import { ProductRepository } from '../repositories/product.repository.js';
import { AppError } from '../errors/AppError.js';
import { HttpStatus } from '../constants/httpStatusCodes.js';
import { ErrorCode } from '../constants/errorCodes.js';

export class CartService {
  static async getCart(userId) {
    let cart = await CartRepository.findByUserIdPopulated(userId);
    if (!cart) {
      cart = await CartRepository.createCart(userId);
      return cart;
    }

    // Auto-normalize stale cart items
    let hasModified = false;
    const validItems = [];

    for (const item of cart.items) {
      const product = item.product;

      // 1. Agar product delete ho gaya ya un-available kar diya gaya
      if (!product || !product.isAvailable) {
        hasModified = true;
        continue; // Discard item
      }

      // 2. Real-time Price Sync
      const currentActivePrice = product.discountPrice ?? product.price;
      if (item.priceSnapshot !== currentActivePrice) {
        item.priceSnapshot = currentActivePrice;
        hasModified = true;
      }

      // 3. Stock boundary normalization
      if (item.quantity > product.stock) {
        if (product.stock === 0) {
          hasModified = true;
          continue; // Zero stock ho to item cart se drop hoga
        }
        item.quantity = product.stock; // Stock jitna bacha hai utna cap kar do
        hasModified = true;
      }

      validItems.push(item);
    }

    if (hasModified || validItems.length !== cart.items.length) {
      cart.items = validItems;
      cart.recalculateTotals();
      await cart.save();
    }

    return cart;
  }

  static async addItemToCart(userId, { productId, quantity }) {
    const product = await ProductRepository.findById(productId);
    if (!product || !product.isAvailable) {
      throw new AppError(
        'Product is not available for purchase',
        HttpStatus.BAD_REQUEST,
        ErrorCode.RESOURCE_NOT_FOUND
      );
    }

    if (product.stock < quantity) {
      throw new AppError(
        `Insufficient stock. Only ${product.stock} units available`,
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR
      );
    }

    let cart = await CartRepository.findByUserId(userId);
    if (!cart) {
      cart = await CartRepository.createCart(userId);
    }

    const currentPrice = product.discountPrice ?? product.price;

    // Robust ObjectId string comparison
    const existingItemIndex = cart.items.findIndex(
      (item) => item.product._id?.toString() === productId.toString() || item.product.toString() === productId.toString()
    );

    if (existingItemIndex > -1) {
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      if (newQuantity > product.stock) {
        throw new AppError(
          `Cannot add quantity. Total would exceed available stock (${product.stock})`,
          HttpStatus.BAD_REQUEST,
          ErrorCode.VALIDATION_ERROR
        );
      }
      cart.items[existingItemIndex].quantity = newQuantity;
      cart.items[existingItemIndex].priceSnapshot = currentPrice;
    } else {
      cart.items.push({
        product: productId,
        quantity,
        priceSnapshot: currentPrice
      });
    }

    cart.recalculateTotals();
    await cart.save();

    return CartRepository.findByUserIdPopulated(userId);
  }

  static async updateItemQuantity(userId, itemId, quantity) {
    const cart = await CartRepository.findByUserIdPopulated(userId);
    if (!cart) {
      throw new AppError('Cart not found', HttpStatus.NOT_FOUND, ErrorCode.RESOURCE_NOT_FOUND);
    }

    const item = cart.items.id(itemId);
    if (!item) {
      throw new AppError('Cart item not found', HttpStatus.NOT_FOUND, ErrorCode.RESOURCE_NOT_FOUND);
    }

    if (quantity > item.product.stock) {
      throw new AppError(
        `Only ${item.product.stock} units available in stock`,
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR
      );
    }

    item.quantity = quantity;
    item.priceSnapshot = item.product.discountPrice ?? item.product.price;

    cart.recalculateTotals();
    await cart.save();

    return cart;
  }

  static async removeItem(userId, itemId) {
    const cart = await CartRepository.findByUserId(userId);
    if (!cart) {
      throw new AppError('Cart not found', HttpStatus.NOT_FOUND, ErrorCode.RESOURCE_NOT_FOUND);
    }

    cart.items.pull(itemId);
    cart.recalculateTotals();
    await cart.save();

    return CartRepository.findByUserIdPopulated(userId);
  }

  static async clearCart(userId) {
    return CartRepository.clearCart(userId);
  }
}