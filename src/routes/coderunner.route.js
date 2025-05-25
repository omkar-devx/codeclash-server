import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { codeRun, codeSubmit } from '../controllers/coderunner.controller.js';
const router = Router();

router.route('/run').post(verifyJWT, codeRun);
router.route('/submit').post(verifyJWT, codeSubmit);

export default router;
