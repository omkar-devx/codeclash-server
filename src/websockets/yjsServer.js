import { WebSocketServer } from 'ws';
import { setupWSConnection } from '@y/websocket-server/utils';

export default class YjsWebSocketServer {
  constructor() {
    this.wss = new WebSocketServer({ noServer: true });

    this.wss.on('connection', (ws, req) => {
      console.log('Yjs WebSocket connection established');
      setupWSConnection(ws, req);
    });

    console.log('🧠 Yjs WebSocket Server initialized');
  }

  handleUpgrade(request, socket, head) {
    this.wss.handleUpgrade(request, socket, head, (ws) => {
      this.wss.emit('connection', ws, request);
    });
  }
}
