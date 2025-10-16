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
    ranking: {
      type: Number,
      default: 0,
    },
    reputation: {
      type: Number,
      default: 0,
    },
    steak: {
      type: Number,
      default: 0,
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
