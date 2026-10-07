import { Session } from '../models/session.model.js';

export class SessionRepository {
  static async create({ userId, refreshTokenHash, userAgent, ipAddress, expiresAt }) {
    return Session.create({
      user: userId,
      refreshTokenHash,
      userAgent,
      ipAddress,
      expiresAt
    });
  }

  static async findByTokenHash(refreshTokenHash) {
    return Session.findOne({ refreshTokenHash });
  }

  static async deleteByTokenHash(refreshTokenHash) {
    return Session.deleteOne({ refreshTokenHash });
  }

  static async deleteAllForUser(userId) {
    return Session.deleteMany({ user: userId });
  }
}