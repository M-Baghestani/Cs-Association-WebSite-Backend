import { Router } from 'express';
import { 
  getEvents, registerForEvent, getMyRegistrations, 
  createEvent, updateEvent, getEventById, getRegistrationStatus, 
  deleteEvent, uploadReceipt 
} from '../controllers/event.controller';
import { protect, admin, optionalAuth } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', getEvents);
router.get('/my-registrations', protect, getMyRegistrations);

router.get('/:id/my-status', protect, getRegistrationStatus); 

router.get('/:id', optionalAuth, getEventById); 
router.post('/:id/register', protect, registerForEvent);
router.post('/:id/receipt', protect, uploadReceipt);
router.put('/:id', protect, admin, updateEvent);
router.delete('/:id', protect, admin, deleteEvent);

router.post('/', protect, admin, createEvent);

export default router;