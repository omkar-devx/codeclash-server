import { WebSocketServer } from 'ws';
import roomManager from './roomManager.js';
import chatHandler from './handlers/chatHandler.js';
import { ApiError } from '../utils/ApiError.js';

class WebSocketService {
  constructor(server) {
    this.wss = new WebSocketServer({ server });
    this.roomManager = new roomManager();
    this.chatHandler = new chatHandler(this.roomManager);

    this.init();
    this.heartbeat();
  }
  init() {
    this.wss.on('connection', (ws) => {
      console.log('client connected....');

      ws.isAlive = true;
      ws.on('pong', () => (ws.isAlive = true));

      ws.meta = {
        roomId: null,
        userId: null,
      };

      ws.on('message', (raw) => {
        try {
          const msg = JSON.parse(raw);
          const { type, payload } = msg;

          switch (type) {
            case 'join-room':
              if (!payload?.roomId || !payload?.userId) {
                throw new ApiError(
                  400,
                  'missing roomId or userId in join-room',
                );
              }
              this.roomManager.addClientToRoom(
                ws,
                payload.roomId,
                payload.userId,
              );
              break;
            case 'chat':
              if (!payload) {
                throw new ApiError(400, 'missing payload for chat');
              }
              this.chatHandler.sendMessage(ws, payload);
              break;
            default:
              throw new ApiError(400, 'Unknown message type');
          }
        } catch (error) {
          console.error('❌ Invalid message format:', error.message);
          if (ws.readyState === ws.OPEN) {
            ws.send(
              JSON.stringify({
                type: 'error',
                message: 'Invalid message format',
              }),
            );
          }
        }
      });

      ws.on('close', () => {
        console.log('client disconnected');
        this.roomManager.removeClient(ws);
      });

      ws.on('error', (err) => {
        console.error('WebSocket error:', err.message);
      });
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
        ws.ping(); // 🔁 Lub-dub
      });
    }, 10000);
  }
}

export default WebSocketService;
