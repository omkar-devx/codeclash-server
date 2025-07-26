import { ApiError } from '../../utils/ApiError.js';
import { addChatMessage } from '../../utils/redis.js';

class chatHandler {
  constructor(roomManager) {
    this.roomManager = roomManager;
  }

  async sendMessage(ws, payload, pub) {
    if (!payload) {
      throw new ApiError(400, 'Missing Payload in Chat!!!');
    }

    const { roomId, userId, message } = payload;

    if (!roomId || !userId || !message) {
      throw new ApiError(
        404,
        'RoomId or UserId or Message may be not present in Chat Payload',
      );
    }

    //get room data : clients,chatHistory,users
    const room = this.roomManager.getRoomFromRoomId(roomId);

    const data = {
      roomId,
      userId,
      message,
      timestamp: Date.now(),
    };

    console.log(`message: ${message} sent in ${roomId}`);

    //push data in chatHistory
    room.chatHistory.push(data);

    if (!room.users.has(userId)) {
      room.users.set(userId, []);
    }

    //push message in users key
    room.users.get(userId).push({ message, timestamp: data.timestamp });
    await addChatMessage(roomId, data);
    pub.publish(roomId, JSON.stringify(data));
  }
}

export default chatHandler;
