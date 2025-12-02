import { Router } from 'express';
import { getJournals, getJournalById, createJournal, deleteJournal } from '../controllers/journal.controller';
import { protect, admin } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', getJournals);
router.get('/:id', getJournalById);
router.post('/', protect, admin, createJournal);
router.delete('/:id', protect, admin, deleteJournal);

export default router;