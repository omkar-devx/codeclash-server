import mongoose, { Schema } from 'mongoose';

const userPreferencesSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    languagePrefered: {
      type: String,
      enum: ['cpp', 'c', 'python', 'java'],
    },
  },
  { timestamps: true },
);

export const UserPreferences = mongoose.model(
  'UserPreferences',
  userPreferencesSchema,
);
