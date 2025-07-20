import mongoose, { Schema } from 'mongoose';

const questionSchema = new Schema(
  {
    uid: {
      type: Number,
      required: true,
      index: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    submitted: {
      type: Number,
      default: 0,
    },
    accepted: {
      type: Number,
      default: 0,
    },
    topics: [
      {
        type: String,
        required: true,
      },
    ],
    hints: [
      {
        type: String,
        required: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export const Question = mongoose.model('Question', questionSchema);
