import mongoose, { Schema, Types } from 'mongoose';

const userProfileSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
      unique: true,
    },
    bio: {
      type: String,
    },
    country: {
      type: String,
    },
    avatarUrl: {
      type: String,
      default: 'https://i.ibb.co/S4W8SnZr/user.png',
    },
    githubUrl: {
      type: String,
    },
    linkedinUrl: {
      type: String,
    },
    visibility: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export const UserProfile = mongoose.model('UserProfile', userProfileSchema);
