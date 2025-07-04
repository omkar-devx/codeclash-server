import { ApiError } from '../utils/ApiError';

class roomManager {
  /*
map([
  [
    "ROOM_ID", --------------------------------> key   : roomId
    {------------------------------------------> value : clients, chatHistory,users
      clients: set([ws1,ws2]),
      chatHistory:[
        {userId,message,timestamp},
        {userId,message,timestamp},
        {.....},
      ],
      users:Map([
        ["USER_ID",{chatMessages: [{message1},{message2}]}],
        ["USER_ID",{chatMessages: [{message1},{message2}]}],
        [.....]
      ])
    }
  ],
  [......]
]);
  */
  constructor() {
    this.rooms = new Map();
  }

  // add users to the rooms
  addClientToRoom(ws, roomId, userId) {
    // room is not created
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        clients: new Set(),
        chatHistory: [],
        users: new Map(),
      });
    }

    // when room is created
    const { clients } = this.rooms.get(roomId);
    clients.add(ws);
    ws.meta.roomId = roomId;
    ws.meta.userId = userId;
  }

  removeClient(ws) {
    const roomId = ws.meta.roomId;

    if (!roomId || !this.rooms.has(roomId)) {
      return;
    }

    const room = this.rooms.get(roomId);
    room.clients.delete(ws);
    if (room.clients.size === 0) {
      this.rooms.delete(roomId);
    }
  }

  getClientsInRoom(roomId) {
    const room = this.rooms.get(roomId);
    return room ? room.clients : new Set();
  }
}

export default roomManager;
