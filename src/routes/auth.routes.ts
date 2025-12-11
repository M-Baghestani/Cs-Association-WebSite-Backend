import {Router} from 'express'

import { register, login, updateProfile, getProfile } from '../controllers/auth.controller';
import { protect } from '../middlewares/auth.middleware'


const router = Router()



router.post('/register', register)
router.post('/login',login)




router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

router.get('/me', protect, (req: any, res) => {
    res.json({ success: true, user: req.user });
});

export default router;