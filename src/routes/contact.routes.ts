import { Router } from 'express';
import { 
    sendMessage, 
    getMyMessages, 
    getAllMessages, 
    replyToTicket, 
    closeTicket,
    editMessage 
} from '../controllers/contact.controller';
import { protect, admin, optionalAuth } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', optionalAuth, sendMessage);
router.get('/my', protect, getMyMessages);
router.get('/', protect, admin, getAllMessages);

router.post('/:id/reply', protect, replyToTicket); 

router.put('/:id/close', protect, closeTicket);



router.put('/:contactId/messages/:messageId', protect, editMessage);


export default router;