import mongoose, { Schema } from 'mongoose';

const submissionSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    questionId: {
      types: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['passed', 'failed'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

export const Submission = mongoose.model('Submission', submissionSchema);
