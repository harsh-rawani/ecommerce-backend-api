import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole, AccountStatus } from '../constants/roles.js';

const addressSchema = new mongoose.Schema(
  {
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true, uppercase: true },
    isDefault: { type: Boolean, default: false }
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false // Never leak password in normal queries
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER
    },
    status: {
      type: String,
      enum: Object.values(AccountStatus),
      default: AccountStatus.ACTIVE
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    addresses: {
      type: [addressSchema],
      default: [],
      validate: [
        (val) => val.length <= 5,
        'Cannot have more than 5 saved addresses'
      ]
    },
    passwordChangedAt: {
      type: Date
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Pre-save hook: Hash password only if modified
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
  
    const SALT_ROUNDS = 12;
    this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
  
    // Set passwordChangedAt if modified on an existing user (skips initial creation)
    if (!this.isNew) {
      this.passwordChangedAt = new Date(Date.now() - 1000);
    }
  });

// Instance method: Secure password comparison
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method: Invalidate tokens issued before password change
userSchema.methods.isPasswordChangedAfter = function (jwtTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return jwtTimestamp < changedTimestamp;
  }
  return false;
};

export const User = mongoose.model('User', userSchema);