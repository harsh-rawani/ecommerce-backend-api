import { ProductRepository } from '../repositories/product.repository.js';
import { AppError } from '../errors/AppError.js';
import { HttpStatus } from '../constants/httpStatusCodes.js';
import { ErrorCode } from '../constants/errorCodes.js';

export class ProductService {
  static async createProduct(productData) {
    let slug = productData.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const existing = await ProductRepository.findBySlug(slug);
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    return ProductRepository.create({ ...productData, slug });
  }

  static async getProductBySlug(slug) {
    const product = await ProductRepository.findBySlug(slug);
    if (!product) {
      throw new AppError('Product not found', HttpStatus.NOT_FOUND, ErrorCode.RESOURCE_NOT_FOUND);
    }
    return product;
  }

  static async getProductById(id) {
    const product = await ProductRepository.findById(id);
    if (!product) {
      throw new AppError('Product not found', HttpStatus.NOT_FOUND, ErrorCode.RESOURCE_NOT_FOUND);
    }
    return product;
  }

  static async listProducts(query) {
    const { page, limit, category, minPrice, maxPrice, search, sort } = query;

    const filter = { isAvailable: true };

    if (category) filter.category = category;
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = minPrice;
      if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    }
    if (search) {
      filter.$text = {$search: search };
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'price_asc') sortOptions = { price: 1 };
    if (sort === 'price_desc') sortOptions = { price: -1 };
    if (sort === 'rating') sortOptions = { averageRating: -1 };

    const skip = (page - 1) * limit;

    const { products, total } = await ProductRepository.findPaginated({
      filter,
      sortOptions,
      skip,
      limit
    });

    return {
      products,
      pagination: {
        page,
        limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async updateProduct(id, updateData) {
    const updated = await ProductRepository.updateById(id, updateData);
    if (!updated) {
      throw new AppError('Product not found', HttpStatus.NOT_FOUND, ErrorCode.RESOURCE_NOT_FOUND);
    }
    return updated;
  }

  static async deleteProduct(id) {
    const deleted = await ProductRepository.deleteById(id);
    if (!deleted) {
      throw new AppError('Product not found', HttpStatus.NOT_FOUND, ErrorCode.RESOURCE_NOT_FOUND);
    }
  }
}