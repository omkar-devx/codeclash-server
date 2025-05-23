import mongoose, { Schema } from 'mongoose';

const userAchievementsSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
      unique: true,
    },
    totalQuestionsSolved: {
      type: Number,
    },
    totalQuestionsAttempted: {
      type: Number,
    },
    totalSubmissions: {
      type: Number,
    },
    questionSolved: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
      },
    ],
    questionLiked: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
      },
    ],
    questionBookmarked: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
      },
    ],
  },
  { timestamps: true },
);

export const UserAchievements = mongoose.model(
  'UserAchievements',
  userAchievementsSchema,
);
