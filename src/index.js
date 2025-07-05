// require("dotenv").config({ path: "./env" });
import dotenv from 'dotenv';
import http, { IncomingMessage } from 'http';
import connectDB from './db/index.js';
import app from './app.js';
import WebSocketService from './websockets/index.js';

const PORT = process.env.PORT || 8000;

dotenv.config({ path: './.env' });

const server = http.createServer(app);

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
