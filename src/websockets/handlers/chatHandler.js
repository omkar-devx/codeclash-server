import { ApiError } from '../../utils/ApiError';
import BroadcastToRoom from '../utils/broadcast';

class chatHandler {
  constructor(roomManager) {
    this.roomManager = roomManager;
  }

  sendMessage(ws, payload) {
    const { roomId, userId, message } = payload;

    if (!roomId || !userId || !message) {
      throw new ApiError(404, 'payload data is not in correct structure');
    }

    const data = {
      ...payload,
      timestamp: Date.now(),
    };

    const clients = this.roomManager.getClientsInRoom(roomId);

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

    const room = this.roomManager.getClientsInRoom(roomId);
    if (!room) {
      throw new ApiError(400, 'Room does not exist');
    }
    room.chatHistory.push(data);
  }
}

export default chatHandler;
