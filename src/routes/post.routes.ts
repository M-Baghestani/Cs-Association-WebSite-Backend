import { Router } from 'express';
import { 
    getPosts, 
    getPostById, 
    getPostBySlug,
    createPost, 
    deletePost, 
    updatePost 
} from '../controllers/post.controller';
import { protect, admin } from '../middlewares/auth.middleware';

const router = Router();


router.get('/', getPosts);


router.get('/slug/:slug', getPostBySlug); 
router.get('/:id', getPostById);

router.post('/', protect, admin, createPost);
router.put('/:id', protect, admin, updatePost);
router.delete('/:id', protect, admin, deletePost);

export default router;