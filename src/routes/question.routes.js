import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {
  questionBookmark,
  questionComment,
  questionLike,
} from '../controllers/question.controller.js';
import { limiter } from '../middlewares/ratelimit.middleware.js';

const router = Router();

router.route('/:questionUid/like').post(verifyJWT, questionLike);
router.route('/:questionUid/comment').post(verifyJWT, limiter, questionComment);
router.route('/:questionUid/bookmark').post(verifyJWT, questionBookmark);

export default router;
