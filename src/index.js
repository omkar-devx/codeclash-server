// require("dotenv").config({ path: "./env" });
import dotenv from 'dotenv';
import http, { IncomingMessage } from 'http';
import connectDB from './db/index.js';
import app from './app.js';
import WebSocketService from './websockets/index.js';
import WebSocket from 'ws';
import { setupWSConnection } from 'y-websocket/bin/utils.js';

const PORT = process.env.PORT || 8000;

dotenv.config({ path: './.env' });

const server = http.createServer(app);

const yjsWSS = new WebSocket.Server({ noServer: true });

server.on('upgrade', (req, socket, head) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const isYjs = url.pathname.startsWith('/yjs');

  if (isYjs) {
    yjsWSS.handleUpgrade(req, socket, head, (ws) => {
      setupWSConnection(ws, req);
    });
  } else {
    WebSocketService.handleUpgrade(req, socket, head);
  }
});

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(
        `✨ server is running on ${PORT} & http://localhost:8000 ✨ \n`,
      );
    });
    new WebSocketService(server);
  })
  .catch(() => {
    console.log('MongoDb Connection FAILDED !!!!');
  });
