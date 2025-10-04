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
    testcase_passed: {
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
    expected_output: {
      type: String,
    },
    stdout: {
      type: String,
    },
    status: {
      type: String,
      enum: ['passed', 'failed'],
    },
    compile_output: {
      type: String,
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
