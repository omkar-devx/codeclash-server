import { ApiError } from '../utils/ApiError.js';

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
    this.subscribedRooms = new Set();
  }

  // add users to the rooms
  addClientToRoom(ws, roomId, userId, sub) {
    // room is not created
    if (!roomId || !userId) {
      throw new ApiError(
        400,
        'Missing RoomId & UserId in Payload of Join-Room!!!',
      );
    }

    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        clients: new Set(),
        chatHistory: [],
        users: new Map(),
      });
    }

    // subscribe to this roomid
    if (!this.subscribedRooms.has(roomId)) {
      sub.subscribe(roomId);
      this.subscribedRooms.add(roomId);
    }

    // when room is created set meta data
    const room = this.rooms.get(roomId);
    room.clients.add(ws);
    if (!room.users.has(userId)) {
      room.users.set(userId, []);
    }
    ws.meta.roomId = roomId;
    ws.meta.userId = userId;
    console.log(`${userId} is joined in ${roomId}`);
  }

  removeClient(ws, sub) {
    const roomId = ws.meta.roomId;

    if (!roomId || !this.rooms.has(roomId)) {
      return;
    }

    const room = this.rooms.get(roomId);
    room.clients.delete(ws);

    console.log(`${ws.meta.userId} disconnected from ${ws.meta.roomId}`);

    if (room.clients.size === 0) {
      this.rooms.delete(roomId);
      sub.unsubscribe(roomId);
      this.subscribedRooms.delete(roomId);
      console.log(`${roomId} deleted..`);
    }
  }

  getRoomFromRoomId(roomId) {
    if (!roomId) {
      throw new ApiError(400, 'Not a valid RoomId to get Room Data');
    }

    const room = this.rooms.get(roomId);

    if (!room) {
      throw new ApiError(400, 'Room is not present on current RoomId');
    }

    return room;
  }

  getClientsInRoom(roomId) {
    const room = this.rooms.get(roomId);
    return room?.clients ?? new Set();
  }
}

export default roomManager;
