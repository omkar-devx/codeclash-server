import mongoose, { Schema } from 'mongoose';

const questionSchema = new Schema(
  {
    uid: {
      type: Number,
      required: true,
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
    },
    submitted: {
      type: Number,
    },
    accepted: {
      type: Number,
    },
    topics: [
      {
        type: String,
      },
    ],
    hints: [
      {
        type: String,
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
