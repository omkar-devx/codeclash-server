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

const DefaultCodeSchema = new Schema(
  {
    cpp: { type: String, required: true },
    java: { type: String, required: true },
    python: { type: String, required: true },
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
    defaultCode: {
      type: DefaultCodeSchema,
      default: {},
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
