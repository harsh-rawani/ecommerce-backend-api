import { ProductService } from '../services/product.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpStatus } from '../constants/httpStatusCodes.js';

export const createProduct = asyncHandler(async (req, res) => {
  const product = await ProductService.createProduct(req.body);
  return ApiResponse.success(res, HttpStatus.CREATED, 'Product created successfully', product);
});

export const getProducts = asyncHandler(async (req, res) => {
  const result = await ProductService.listProducts(req.query);
  return ApiResponse.success(
    res,
    HttpStatus.OK,
    'Products retrieved successfully',
    result.products,
    result.pagination
  );
});

export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await ProductService.getProductBySlug(req.params.slug);
  return ApiResponse.success(res, HttpStatus.OK, 'Product details retrieved', product);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await ProductService.updateProduct(req.params.id, req.body);
  return ApiResponse.success(res, HttpStatus.OK, 'Product updated successfully', product);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  await ProductService.deleteProduct(req.params.id);
  return ApiResponse.success(res, HttpStatus.OK, 'Product deleted successfully');
});