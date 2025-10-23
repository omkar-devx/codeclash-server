import mongoose, { Schema } from 'mongoose';

const questionSolSchema = new Schema(
  {
    uid: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    solution: {
      cpp: { type: String, required: true, trim: true },
      java: { type: String, required: true, trim: true },
      python: { type: String, required: true, trim: true },
    },
  },
  { timestamps: true },
);

export const QuestionSol = mongoose.model('QuestionSol', questionSolSchema);
export default QuestionSol;
