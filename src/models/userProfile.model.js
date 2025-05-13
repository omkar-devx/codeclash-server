import mongoose, { Schema, Types } from 'mongoose';

const userProfileSchemaSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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

export const UserProfileSchema = mongoose.model(
  'UserProfileSchema',
  userProfileSchemaSchema,
);
