import mongoose, { Schema } from 'mongoose';

const roomSchema = new Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  roomId: {
    type: String,
    required: true,
  },
  questionArray: {
    type: [Number],
    required: true,
  },
});

export const Room = mongoose.model('Room', roomSchema);
