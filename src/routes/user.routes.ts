
import { Router } from 'express';
import { getUsers } from '../controllers/user.controller';
import { protect, admin } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', protect, admin, getUsers);

export default router;