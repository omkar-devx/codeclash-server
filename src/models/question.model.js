import mongoose from 'mongoose';

const { Schema } = mongoose;

const ExampleSchema = new Schema(
  {
    input: { type: String, required: true },
    output: { type: String, required: true },
    explanation: { type: String, default: '' },
  },
  { _id: false },
);

const QuestionSchema = new Schema(
  {
    uid: {
      type: Number,
      required: true,
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
    examples: {
      type: [ExampleSchema],
      default: [],
    },
    constraints: {
      type: [String],
      default: [],
    },
    topics: {
      type: [String],
      default: [],
    },
    hints: {
      type: [String],
      default: [],
    },
    submitted: {
      type: Number,
      default: 0,
    },
    accepted: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export const Question = mongoose.model('Question', QuestionSchema);
export default Question;
