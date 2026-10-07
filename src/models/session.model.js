import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    // SHA-256 hash of the issued refresh token
    refreshTokenHash: {
      type: String,
      required: true,
      index: true
    },
    userAgent: {
      type: String,
      default: 'unknown'
    },
    ipAddress: {
      type: String,
      default: 'unknown'
    },
    // TTL index: MongoDB automatically purges expired sessions
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }
    }
  },
  {
    timestamps: true
  }
);

export const Session = mongoose.model('Session', sessionSchema);