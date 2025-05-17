import { Router } from 'express';
import { userLogin, userRegsiter } from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

router.route('/register').post(upload.single('avatar'), userRegsiter);
router.route('/login').post(userLogin);

export default router;
