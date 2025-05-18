import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {
  questionComment,
  questionLike,
} from '../controllers/question.controller.js';
import { limiter } from '../middlewares/ratelimit.middleware.js';

const router = Router();

router.route('/:questionUid/like').post(verifyJWT, questionLike);
router.route('/:questionUid/comment').post(verifyJWT, limiter, questionComment);

export default router;
