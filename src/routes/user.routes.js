import { Router } from 'express';
import { userRegsiter } from '../controllers/user.controller.js';

const router = Router();

router.route('/register').post(userRegsiter);

export default router;
