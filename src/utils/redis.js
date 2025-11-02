import Redis from 'ioredis';

const isProduction = process.env.NODE_ENV === 'production';

export const redis = new Redis({
  host: isProduction ? '127.0.0.1' : 'localhost',
  port: 6379,
});

//  add user to room
export const addUserToRoom = async (roomId, userId) => {
  await redis.sadd(`room:${roomId}:user`, userId);
};

// remove user from room
export const removeUserToRoom = async (roomId, userId) => {
  await redis.srem(`room:${roomId}:user`, userId);
};

// get all the user in the room
export const getUserToRoom = async (roomId) => {
  const usersToRoom = await redis.smembers(`room:${roomId}:user`);
  return usersToRoom;
};

// is userid present in the room
export const isUserPresentInRoom = async (roomId, userId) => {
  return await redis.sismember(`room:${roomId}:user`, userId);
};

// add user is online
export const addUserOnline = async (roomId, userId) => {
  await redis.sadd(`room:${roomId}:online`, userId);
};

// remove user is online
export const removeUserOnline = async (roomId, userId) => {
  await redis.srem(`room:${roomId}:online`, userId);
};

// get all the user is online
export const getUsersOnline = async (roomId) => {
  const usersOnline = await redis.smembers(`room:${roomId}:online`);

  return usersOnline;
};

// check is user is online
export const isUserOnline = async (roomId, userId) => {
  return await redis.sismember(`room:${roomId}:online`, userId);
};

// send chat messages
export const addChatMessage = async (roomId, data) => {
  await redis.lpush(`room:${roomId}:chat`, JSON.stringify(data));
  await redis.ltrim(`room:${roomId}:chat`, -100, -1);
};

// get chat messages
export const getChatMessage = async (roomId) => {
  const messages = await redis.lrange(`room:${roomId}:chat`, -50, -1);
  return messages.map((msg) => JSON.parse(msg));
};
