import { CartService } from '../services/cart.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpStatus } from '../constants/httpStatusCodes.js';

export const getCart = asyncHandler(async (req, res) => {
  const cart = await CartService.getCart(req.user._id);
  return ApiResponse.success(res, HttpStatus.OK, 'Cart retrieved successfully', cart);
});

export const addItemToCart = asyncHandler(async (req, res) => {
  const cart = await CartService.addItemToCart(req.user._id, req.body);
  return ApiResponse.success(res, HttpStatus.OK, 'Item added to cart successfully', cart);
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const cart = await CartService.updateItemQuantity(
    req.user._id,
    req.params.itemId,
    req.body.quantity
  );
  return ApiResponse.success(res, HttpStatus.OK, 'Cart updated successfully', cart);
});

export const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await CartService.removeItem(req.user._id, req.params.itemId);
  return ApiResponse.success(res, HttpStatus.OK, 'Item removed from cart', cart);
});

export const clearCart = asyncHandler(async (req, res) => {
  const cart = await CartService.clearCart(req.user._id);
  return ApiResponse.success(res, HttpStatus.OK, 'Cart cleared successfully', cart);
});