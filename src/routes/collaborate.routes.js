import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {
  chatHistory,
  createRoom,
  getCurrentRoom,
  joinRoom,
  leaveRoom,
} from '../controllers/collaborate.controller.js';

const router = Router();
router.route('/join-room').post(verifyJWT, joinRoom);
router.route('/current-room').post(verifyJWT, getCurrentRoom);
router.route('/create-room').post(verifyJWT, createRoom);
router.route('/leave-room').post(verifyJWT, leaveRoom);
router.route('/chat-history').post(verifyJWT, chatHistory);

export default router;
