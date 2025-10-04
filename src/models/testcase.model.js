import mongoose, { Schema } from 'mongoose';

const testcaseSchema = new Schema(
  {
    questionUId: {
      type: Number,
      index: true,
      required: true,
    },
    input: {
      type: String,
      required: true,
    },
    output: [
      {
        type: String,
        required: true,
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
