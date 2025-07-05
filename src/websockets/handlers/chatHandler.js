import { ApiError } from '../../utils/ApiError.js';

class chatHandler {
  constructor(roomManager) {
    this.roomManager = roomManager;
  }

  sendMessage(ws, payload) {
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
    //get all clients
    const clients = this.roomManager.getClientsInRoom(roomId);

    const data = {
      roomId,
      userId,
      message,
      timestamp: Date.now(),
    };

    for (const client of clients) {
      if (client.readyState === client.OPEN) {
        client.send(
          JSON.stringify({
            type: 'chat-message',
            payload: data,
          }),
        );
      }
    }

    console.log(`message: ${message} sent in ${roomId}`);

    //push data in chatHistory
    room.chatHistory.push(data);

    if (!room.users.has(userId)) {
      room.users.set(userId, []);
    }

    //push message in users key
    room.users.get(userId).push({ message, timestamp: data.timestamp });
  }
}

export default chatHandler;
