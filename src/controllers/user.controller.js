import { UserService } from '../services/user.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpStatus } from '../constants/httpStatusCodes.js';

export const getMe = asyncHandler(async (req, res) => {
  return ApiResponse.success(res, HttpStatus.OK, 'Profile retrieved successfully', req.user);
});

export const updateMe = asyncHandler(async (req, res) => {
  const updatedUser = await UserService.updateProfile(req.user._id, req.body);
  return ApiResponse.success(res, HttpStatus.OK, 'Profile updated successfully', updatedUser);
});

export const changePassword = asyncHandler(async (req, res) => {
  await UserService.changePassword(req.user._id, req.body);
  return ApiResponse.success(
    res,
    HttpStatus.OK,
    'Password changed successfully. Please log in again.'
  );
});

export const addAddress = asyncHandler(async (req, res) => {
  const addresses = await UserService.addAddress(req.user._id, req.body);
  return ApiResponse.success(res, HttpStatus.CREATED, 'Address added successfully', addresses);
});