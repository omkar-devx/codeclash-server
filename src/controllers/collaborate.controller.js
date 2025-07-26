import { Room } from '../models/room.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  getChatMessage,
  removeUserOnline,
  removeUserToRoom,
} from '../utils/redis.js';

// create room
const createRoom = asyncHandler(async (req, res) => {
  const userId = req.user.username;
  const { roomId, questionArray } = req.body;

  if (!userId || !roomId) {
    throw new ApiError(400, 'UserId or roomId not found');
  }

  const room = await Room.insertOne({ userId, roomId, questionArray });
  if (!room) {
    throw new ApiError(401, 'Unable to create Room');
  }

  return res.status(200).json(new ApiResponse(200, room, 'Room is created'));
});

// join current room
const joinRoom = asyncHandler(async (req, res) => {
  const userId = req.user.username;
  const { roomId } = req.body;
  console.log('roomId', roomId);
  if (!userId || !roomId) {
    throw new ApiError(400, 'userId or roomId not found');
  }

  const existRoom = await Room.findOne({ userId });
  if (existRoom) {
    throw new ApiError(400, 'Already Room joined');
  }

  const room = await Room.findOne({
    roomId: JSON.parse(roomId),
  });
  // console.log('d: ', typeof roomId);
  if (!room) {
    throw new ApiError(400, 'given roomId is invalid or not created');
  }

  const roomJoined = await Room.insertOne({
    userId,
    roomId: room.roomId,
    questionArray: room.questionArray,
  });
  if (!roomJoined) {
    throw new ApiError(400, 'Unable to join the room');
  }

  return res.status(200).json(new ApiResponse(200, roomJoined, 'Room Joined'));
});

//get current room
const getCurrentRoom = asyncHandler(async (req, res) => {
  const userId = req.user.username;
  if (!userId) {
    throw new ApiError(400, "UserId didn't found");
  }

  const currentRoom = await Room.findOne({ userId });
  if (currentRoom) {
    return res
      .status(200)
      .json(new ApiResponse(200, currentRoom, 'room is present'));
  }

  return res.status(200).json(new ApiResponse(200, null, 'room is not found'));
});

// leave room
const leaveRoom = asyncHandler(async (req, res) => {
  const userId = req.user.username;
  if (!userId) {
    throw new ApiError(400, 'userId is not found');
  }

  const room = await Room.findOne({ userId });
  if (!room) {
    throw new ApiError(400, 'User Room not Found');
  }

  await removeUserToRoom(room.roomId, userId);
  await removeUserOnline(room.roomId, userId);
  await Room.deleteOne({ userId });

  return res
    .status(200)
    .json(new ApiResponse(200, null, `${userId} leaved the room`));
});

const chatHistory = asyncHandler(async (req, res) => {
  console.log(req.body);
  const { roomId } = req.body;
  if (!roomId) {
    throw new ApiError(400, 'no room found');
  }

  const chatHistory = await getChatMessage(roomId);

  return res
    .status(200)
    .json(new ApiResponse(200, chatHistory, 'chat history'));
});

export { createRoom, joinRoom, getCurrentRoom, leaveRoom, chatHistory };
