import { Router } from 'express';
import { 
    getJournals, 
    getJournalById, 
    createJournal, 
    deleteJournal,
    downloadJournal
} from '../controllers/journal.controller';
import { protect, admin } from '../middlewares/auth.middleware';

const router = Router();

router.get('/download', downloadJournal);

router.get('/', getJournals);

router.get('/:id', getJournalById);

router.post('/', protect, admin, createJournal);
router.delete('/:id', protect, admin, deleteJournal);

export default router;