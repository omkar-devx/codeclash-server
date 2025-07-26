import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('codeclash - server');
});

// router imports
import userRouter from './routes/auth.routes.js';
import adminRouter from './routes/admin.routes.js';
import questionRouter from './routes/question.routes.js';
import coderunnerRouter from './routes/coderunner.route.js';
import collaborateRouter from './routes/collaborate.routes.js';
import { ApiError } from './utils/ApiError.js';

const prefix = '/api/v1';

// router declarations
app.use(`${prefix}/auth`, userRouter);
// app.use(`${prefix}/users`, userRouter);
app.use(`${prefix}/admin`, adminRouter);
app.use(`${prefix}/questions`, questionRouter);
app.use(`${prefix}/coderunner`, coderunnerRouter);
app.use(`${prefix}/collaborate`, collaborateRouter);

// custom error response
app.use((err, req, res, next) => {
  console.log(err);
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: err.message,
      data: err.data,
      stack: undefined,
    });
  }
  return res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: err.message,
    data: null,
    stack: undefined,
  });
});

export default app;
