import { Router } from 'express';
import { submitComment, getPostComments } from '../controllers/comment.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.get('/:postId', getPostComments);

router.post('/:postId', protect, submitComment);

export default router;