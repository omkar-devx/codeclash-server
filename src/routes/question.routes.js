import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {
  createQuestion,
  getQuestionSolution,
  getSubmissionById,
  isQuestionSubmitted,
  multipleQuestions,
  problemset,
  questionBookmark,
  questionById,
  questionComment,
  questionLike,
  questionSolution,
  questionTestcase,
  searchQuestions,
} from '../controllers/question.controller.js';
import { limiter } from '../middlewares/ratelimit.middleware.js';

const router = Router();

//get
router.route('/problemset').get(problemset);
router.route('/search').get(searchQuestions);
router.route('/id/:id').get(questionById);
router.route('/issubmit/:id').get(isQuestionSubmitted);
router.route('/submission/:sid').get(getSubmissionById);
router.route('/getsolution/:id').get(getQuestionSolution);
//post
router.route('/create-question').post(verifyJWT, createQuestion);
router.route('/multiple-question').post(verifyJWT, multipleQuestions);
router.route('/create-testcase').post(verifyJWT, questionTestcase);
router.route('/:questionUid/like').post(verifyJWT, questionLike);
router.route('/:questionUid/bookmark').post(verifyJWT, questionBookmark);
router.route('/:questionUid/comment').post(verifyJWT, limiter, questionComment);
router.route('/solution').post(questionSolution);

export default router;
