import { Router } from 'express';
import { 
    getDashboardStats, 
    getAdminRegistrations, 
    updateRegistrationStatus 
} from '../controllers/admin.controller'; 
import { protect, admin } from '../middlewares/auth.middleware';
import { 

    getPendingComments, 
    replyAndApproveComment,
    deleteComment,
    getAllCommentsAdmin
} from '../controllers/comment.controller';
const router = Router();





router.get('/stats', protect, admin, getDashboardStats);


router.get('/comments/pending', protect, admin, getPendingComments);
router.delete('/comments/:commentId', protect, admin, deleteComment);
router.put('/comments/approve/:commentId', protect, admin, replyAndApproveComment);
router.get('/comments/all', protect, admin, getAllCommentsAdmin);


router.get('/registrations', protect, admin, getAdminRegistrations);
router.put('/registrations/:id/status', protect, admin, updateRegistrationStatus);





export default router;