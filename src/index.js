// require("dotenv").config({ path: "./env" });
import dotenv from 'dotenv';
import connectDB from './db/index.js';
const PORT = process.env.PORT || 8000;
import app from './app.js';

dotenv.config({ path: './.env' });

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✨ server is running on ${PORT} & http://localhost:8000 ✨`);
    });
  })
  .catch(() => {
    console.log('MongoDb Connection FAILDED !!!!');
  });
