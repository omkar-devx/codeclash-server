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
import userRouter from './routes/user.routes.js';
import adminRouter from './routes/admin.routes.js';
import questionRouter from './routes/question.routes.js';
import coderunnerRouter from './routes/coderunner.route.js';

const prefix = '/api/v1';

// router declarations
app.use(`${prefix}/users`, userRouter);
app.use(`${prefix}/admin`, adminRouter);
app.use(`${prefix}/questions`, questionRouter);
app.use(`${prefix}/coderunner`, coderunnerRouter);

export default app;
