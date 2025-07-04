import { WebSocketServer } from 'ws';
import roomManager from './roomManager.js';
import chatHandler from './handlers/chatHandler.js';
// import codeHandler from './handlers/codeHandler';

class WebSocketService {
  constructor(server) {
    this.wss = new WebSocketServer({ server });
    this.roomManager = new roomManager();
    this.chatHandler = new chatHandler(this.roomManager);
    // this.codeHandler = new codeHandler

    this.init();
  }
  init() {
    this.wss.on('connection', (ws) => {
      console.log('client connected....');

      ws.meta = {
        roomId: null,
        userId: null,
      };

      ws.on('message', (msg) => {
        const message = msg.toString();
        console.log(message);
        if (message === 'ping') {
          ws.send('pong');
        }
      });
    });
  }
}

export default WebSocketService;
