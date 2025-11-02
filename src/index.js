import { config } from 'dotenv';
config();
import http from 'http';
import connectDB from './db/index.js';
import app from './app.js';
import WebSocketService from './websockets/index.js';
import YjsWebSocketServer from './websockets/yjsServer.js';
import { parse } from 'url';

const PORT = process.env.PORT || 8000;

if (process.env.SIMULATE_CONTAINER_FAILURE === 'true') {
  console.error('Simulated container failure');
  process.exit(1);
}

const server = http.createServer(app);

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(
        `✨ server is running on ${PORT} & http://localhost:${PORT} ✨ \n`,
      );
    });

    const webSocketService = new WebSocketService();
    const yjsWebSocketServer = new YjsWebSocketServer();

    server.on('upgrade', (request, socket, head) => {
      const { pathname } = parse(request.url);

      console.log('Upgrade request for:', pathname);

      if (pathname && pathname.startsWith('/yjs')) {
        yjsWebSocketServer.handleUpgrade(request, socket, head);
      } else {
        webSocketService.handleUpgrade(request, socket, head);
      }
    });

    console.log('🚀 All WebSocket services initialized');
  })
  .catch((error) => {
    console.log('MongoDb Connection FAILED !!!!', error);
  });
