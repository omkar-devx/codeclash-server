import { Router } from 'express';
import {
  userLogin,
  userLogout,
  userRegsiter,
} from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.route('/register').post(upload.single('avatar'), userRegsiter);
router.route('/login').post(userLogin);
router.route('/logout').post(verifyJWT, userLogout);

export default router;
