import {Router} from 'express'

import { register, login, updateProfile, googleLogin } from '../controllers/auth.controller';
import { protect } from '../middlewares/auth.middleware'


const router = Router()



router.post('/register', register)
router.post('/login',login)

router.put('/profile', protect, updateProfile);

router.get('/me', protect, (req: any, res) => {
    res.json({ success: true, user: req.user });
});
router.post('/google', googleLogin); // New Route for Google Login

export default router;