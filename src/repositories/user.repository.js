import { User } from '../models/user.model.js';

export class UserRepository {
  static async create(userData) {
    return User.create(userData);
  }

  static async findByEmail(email) {
    return User.findOne({ email }).lean();
  }

  static async findByEmailWithPassword(email) {
    return User.findOne({ email }).select('+password');
  }

  static async findById(id) {
    return User.findById(id).lean();
  }

  static async existsByEmail(email) {
    const count = await User.countDocuments({ email });
    return count > 0;
  }
}