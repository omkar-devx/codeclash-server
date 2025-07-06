import dotenv from 'dotenv';
import http from 'http';
import connectDB from './db/index.js';
import app from './app.js';
import WebSocketService from './websockets/index.js';
import YjsWebSocketServer from './websockets/yjsServer.js';
import { parse } from 'url';

const PORT = process.env.PORT || 8000;

dotenv.config({ path: './.env' });

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
