import { WebSocketServer } from 'ws';
import { setupWSConnection } from '@y/websocket-server/utils';
import { RedisPersistence } from 'y-redis';
import { redis } from '../utils/redis.js';

export default class YjsWebSocketServer {
  constructor() {
    this.wss = new WebSocketServer({ noServer: true });
    const persistence = new RedisPersistence(redis);

    this.wss.on('connection', (ws, req) => {
      console.log('Yjs WebSocket connection established');
      setupWSConnection(ws, req, {
        persistence,
        gc: true,
      });
    });

    console.log('🧠 Yjs WebSocket Server initialized');
  }

  handleUpgrade(request, socket, head) {
    this.wss.handleUpgrade(request, socket, head, (ws) => {
      this.wss.emit('connection', ws, request);
    });
  }
}
