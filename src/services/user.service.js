import { User } from '../models/user.model.js';
import { SessionRepository } from '../repositories/session.repository.js';
import { AppError } from '../errors/AppError.js';
import { HttpStatus } from '../constants/httpStatusCodes.js';
import { ErrorCode } from '../constants/errorCodes.js';

export class UserService {
  static async updateProfile(userId, updateData) {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    return user;
  }

  static async changePassword(userId, { currentPassword, newPassword }) {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new AppError('User not found', HttpStatus.NOT_FOUND, ErrorCode.RESOURCE_NOT_FOUND);
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new AppError(
        'Current password does not match',
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR
      );
    }

    user.password = newPassword;
    await user.save();

    // Revoke all existing refresh sessions across all devices
    await SessionRepository.deleteAllForUser(userId);
  }

  static async addAddress(userId, addressData) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', HttpStatus.NOT_FOUND, ErrorCode.RESOURCE_NOT_FOUND);
    }

    if (user.addresses.length >= 5) {
      throw new AppError(
        'Address limit reached. Max 5 addresses permitted.',
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR
      );
    }

    if (addressData.isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    } else if (user.addresses.length === 0) {
      addressData.isDefault = true;
    }

    user.addresses.push(addressData);
    await user.save();
    return user.addresses;
  }
}