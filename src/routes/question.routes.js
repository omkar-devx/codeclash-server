import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {
  createQuestion,
  problemset,
  questionBookmark,
  questionById,
  questionComment,
  questionLike,
} from '../controllers/question.controller.js';
import { limiter } from '../middlewares/ratelimit.middleware.js';

const router = Router();

router.route('/problemset').get(problemset);
router.route('/:id').get(questionById);

router.route('/create-question').post(verifyJWT, createQuestion);
router.route('/:questionUid/like').post(verifyJWT, questionLike);
router.route('/:questionUid/bookmark').post(verifyJWT, questionBookmark);
router.route('/:questionUid/comment').post(verifyJWT, limiter, questionComment);

export default router;
