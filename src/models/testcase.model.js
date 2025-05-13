import mongoose, { Schema } from 'mongoose';

const testcaseSchema = new Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
    },
    input: [
      {
        type: String,
      },
    ],
    output: [
      {
        type: String,
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

export const Testcase = mongoose.model('Testcase', testcaseSchema);
