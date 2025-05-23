import mongoose, { Schema } from 'mongoose';

const userSessionSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    userAgent: {
      type: String, // User Defice Info
    },
    ipAddress: {
      type: String,
    },
    refreshToken: {
      type: String,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

export const UserSession = mongoose.model('UserSession', userSessionSchema);
