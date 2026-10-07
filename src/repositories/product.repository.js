import { Product } from '../models/product.model.js';

export class ProductRepository {
  static async create(productData) {
    return Product.create(productData);
  }

  static async findById(id) {
    return Product.findById(id).lean();
  }

  static async findBySlug(slug) {
    return Product.findOne({ slug }).lean();
  }

  static async updateById(id, updateData) {
    return Product.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true }).lean();
  }

  static async deleteById(id) {
    return Product.findByIdAndDelete(id).lean();
  }

  static async findPaginated({ filter, sortOptions, skip, limit }) {
    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter)
    ]);

    return { products, total };
  }
}