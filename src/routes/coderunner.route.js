import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware';
import { codeRun, codeSumit } from '../controllers/coderunner.controller';
const router = Router();

router.route('/run').post(verifyJWT, codeRun);
router.route('/submit').post(verifyJWT, codeSumit);

export default router;
