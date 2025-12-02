import { Request, Response } from 'express';
import Post from '../models/Post';
import Comment from '../models/Comment'; 
import { AuthRequest } from '../middlewares/auth.middleware';

export const getPostBySlug = async (req: Request, res: Response) => {
    try {
        const slug = decodeURIComponent(req.params.slug);

        const post = await Post.findOne({ slug }).populate('author', 'name');

        if (!post) {
            return res.status(404).json({ success: false, message: 'پست با این آدرس یافت نشد.' });
        }
        
        res.json({ success: true, data: post });
    } catch (error) {
        console.error("Error getting post by slug:", error);
        res.status(500).json({ success: false, message: 'خطای سرور' });
    }
};

export const deletePost = async (req: AuthRequest, res: Response) => {
    const postId = req.params.id;
    console.log(`🗑️ Attempting to delete post ID: ${postId}`);

    try {
        const post = await Post.findById(postId);
        if (!post) {
            console.log("❌ Post ID not found for deletion");
            return res.status(404).json({ success: false, message: 'پست یافت نشد.' });
        }

        console.log("... Deleting associated comments");
        await Comment.deleteMany({ post: postId });
        
        console.log("... Deleting post document");
        await Post.deleteOne({ _id: postId });

        console.log("✅ Delete Successful");
        res.json({ success: true, message: 'پست و نظرات آن حذف شدند.' });

    } catch (error) {
        console.error("🔥 DELETE ERROR DETAILS:", error); 
        res.status(500).json({ success: false, message: 'خطای سرور در حذف.', error: error });
    }
};

export const getPosts = async (req: Request, res: Response) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 }).populate('author', 'name');
        res.json({ success: true, data: posts });
    } catch (error) { res.status(500).json({ success: false, message: 'Error' }); }
};

export const getPostById = async (req: Request, res: Response) => {
    try {
        const post = await Post.findById(req.params.id).populate('author', 'name');
        if(!post) return res.status(404).json({success: false});
        res.json({ success: true, data: post });
    } catch (error) { res.status(500).json({ success: false }); }
};



export const createPost = async (req: AuthRequest, res: Response) => {
    try {
        const { title, slug, content, thumbnail, category } = req.body;
        const post = await Post.create({
            title, slug, content, thumbnail, category,
            author: req.user.id, isApproved: true, commentsCount: 0
        } as any);
        res.status(201).json({ success: true, data: post });
    } catch (error: any) {
        if (error.code === 11000) return res.status(400).json({ success: false, message: 'اسلاگ تکراری' });
        res.status(500).json({ success: false, message: 'Error' });
    }
};

export const updatePost = async (req: AuthRequest, res: Response) => {
     try {
        const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if(!post) return res.status(404).json({success: false});
        res.json({ success: true, data: post });
    } catch (error) { res.status(500).json({ success: false }); }
};