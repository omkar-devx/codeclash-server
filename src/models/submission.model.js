import mongoose, { Schema } from 'mongoose';

const submissionSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    questionUId: {
      type: Number,
      required: true,
    },
    source_code: {
      type: String,
      required: true,
    },
    testcase_count: {
      type: Number,
    },
    time: {
      type: Number,
    },
    memory: {
      type: Number,
    },
    failedTestCase: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['passed', 'failed'],
    },
    message: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

export const Submission = mongoose.model('Submission', submissionSchema);
