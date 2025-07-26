import { WebSocketServer } from 'ws';
import roomManager from './handlers/roomManager.js';
import chatHandler from './handlers/chatHandler.js';
import Redis from 'ioredis';
import { ApiError } from '../utils/ApiError.js';

class WebSocketService {
  constructor() {
    this.pub = new Redis();
    this.sub = new Redis();

    this.redisEventsCheck(this.pub, 'publisher');
    this.redisEventsCheck(this.sub, 'subscriber');

    this.wss = new WebSocketServer({ noServer: true });

    this.roomManager = new roomManager();
    this.chatHandler = new chatHandler(this.roomManager);

    this.init();
    this.subscribeToMessage();
    this.heartbeat();
  }

  redisEventsCheck(redisClient, clientName = 'redis') {
    redisClient.on('connect', () => {
      console.log(`${clientName} is connected 🔗`);
    });

    redisClient.on('error', (err) => {
      console.log(`${clientName} have error`, err.message);
    });

    redisClient.on('end', () => {
      console.log(`${clientName} connection ended `);
    });
  }

  init() {
    this.wss.on('connection', (ws) => {
      console.log('Regular WebSocket client connected....');

      ws.isAlive = true;
      ws.on('pong', () => {
        ws.isAlive = true;
        console.log('server is alive');
      });

      // storing metadata in the socket
      ws.meta = {
        roomId: null,
        userId: null,
      };

      ws.on('message', (raw) => {
        try {
          const msg = JSON.parse(raw);
          const { type, payload } = msg;
          console.log(type);

          if (!type || typeof payload !== 'object') {
            throw new ApiError(400, 'Invalid message structure');
          }

          switch (type) {
            case 'join-room':
              this.roomManager.addClientToRoom(
                ws,
                payload.roomId,
                payload.userId,
                this.sub,
              );
              break;

            case 'chat':
              this.chatHandler.sendMessage(ws, payload, this.pub);
              break;

            default:
              throw new ApiError(400, 'Unknown message type');
          }
        } catch (error) {
          console.error('Error : ', error.message);
          if (ws.readyState === ws.OPEN) {
            ws.send(
              JSON.stringify({
                type: 'error',
                message: error.message,
              }),
            );
          }
        }
      });

      ws.on('close', () => {
        this.roomManager.removeClient(ws, this.sub);
      });

      ws.on('error', (err) => {
        console.error('WebSocket error:', err.message);
      });
    });
  }

  subscribeToMessage() {
    this.sub.on('message', (channel, raw) => {
      let room;
      try {
        room = this.roomManager.getRoomFromRoomId(channel);
      } catch (e) {
        console.warn(`Room ${channel} not found. Dropping message.`);
        return;
      }
      const message = JSON.parse(raw);
      for (const client of room.clients) {
        if (client.readyState === client.OPEN) {
          client.send(
            JSON.stringify({
              type: 'chat-message',
              payload: message,
            }),
          );
        }
      }
    });
  }

  heartbeat() {
    setInterval(() => {
      this.wss.clients.forEach((ws) => {
        if (!ws.isAlive) {
          this.roomManager.removeClient(ws);
          return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);
  }

  handleUpgrade(request, socket, head) {
    this.wss.handleUpgrade(request, socket, head, (ws) => {
      this.wss.emit('connection', ws, request);
    });
  }
}

export default WebSocketService;
