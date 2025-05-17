import { Router } from 'express';
import { userRegsiter } from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

router.route('/register').post(upload.single('avatar'), userRegsiter);

export default router;
