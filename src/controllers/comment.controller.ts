import { Request, Response } from 'express';
import Comment from '../models/Comment';
import Post from '../models/Post';
import { AuthRequest } from '../middlewares/auth.middleware';

// ------------------------------------
// A. ارسال نظر جدید توسط کاربر (Public)
// ------------------------------------
export const submitComment = async (req: AuthRequest, res: Response) => {
    const { postId } = req.params;
    const { content } = req.body;
    
    // 🚨 FIX: استفاده از 'id' به جای '_id' (بر اساس ساختار توکن)
    const userId = req.user.id; 

    try {
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ success: false, message: 'پست یافت نشد.' });

        await Comment.create({
            post: postId,
            user: userId,
            content: content,
            isApproved: false, // ابتدا در انتظار تأیید ادمین است
        });
        
        // افزایش شمارنده کامنت‌ها (اختیاری - فعلاً غیرفعال تا از همگام‌سازی مطمئن شویم)
        // await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

        res.status(201).json({ success: true, message: 'نظر شما ثبت شد و در انتظار تأیید است.' });
    } catch (error) {
        console.error("Comment submission error:", error);
        res.status(500).json({ success: false, message: 'خطای سرور.' });
    }
};

// ------------------------------------
// B. دریافت کامنت‌های یک پست (Public)
// ------------------------------------
export const getPostComments = async (req: Request, res: Response) => {
    const { postId } = req.params;
    try {
        // فقط کامنت‌های تأیید شده را نشان بده
        const comments = await Comment.find({ post: postId, isApproved: true })
            .populate('user', 'name') 
            .sort({ createdAt: 1 }); 

        res.status(200).json({ success: true, data: comments });
    } catch (error) {
        res.status(500).json({ success: false, message: 'خطای سرور.' });
    }
};

// ------------------------------------
// C. دریافت کامنت‌های در انتظار تأیید (Admin)
// ------------------------------------
export const getPendingComments = async (req: AuthRequest, res: Response) => {
    try {
        const pendingComments = await Comment.find({ isApproved: false })
            .populate('user', 'name email')
            .populate('post', 'title')
            .sort({ createdAt: 1 });

        res.status(200).json({ success: true, data: pendingComments });
    } catch (error) {
        res.status(500).json({ success: false, message: 'خطای سرور.' });
    }
};

// ------------------------------------
// D. پاسخ ادمین و تأیید نهایی (Admin)
// ------------------------------------
export const replyAndApproveComment = async (req: AuthRequest, res: Response) => {
    const { commentId } = req.params;
    const { replyContent } = req.body; 

    try {
        const updateFields: any = {
            isApproved: true, // تأیید نظر کاربر
        };
        
        if (replyContent && replyContent.trim().length > 0) {
            updateFields.adminReplyContent = replyContent;
            updateFields.adminRepliedAt = new Date();
            updateFields.isNewReply = true;
        } else {
            updateFields.adminReplyContent = '';
            updateFields.adminRepliedAt = undefined;
            updateFields.isNewReply = false;
        }

        const comment = await Comment.findByIdAndUpdate(
            commentId,
            updateFields,
            { new: true }
        );

        if (comment) {
             await Post.findByIdAndUpdate(comment.post, { $inc: { commentsCount: 1 } });
        }

        res.status(200).json({ success: true, message: 'عملیات با موفقیت انجام شد.' });
    } catch (error) {
        console.error("Reply error:", error);
        res.status(500).json({ success: false, message: 'خطای سرور.' });
    }
};


// ------------------------------------
// E. حذف نظر (Admin)
// ------------------------------------
export const deleteComment = async (req: AuthRequest, res: Response) => {
    const { commentId } = req.params;

    try {
        await Comment.findByIdAndDelete(commentId);
        res.status(200).json({ success: true, message: 'نظر با موفقیت حذف شد.' });
    } catch (error) {
        console.error("Delete comment error:", error);
        res.status(500).json({ success: false, message: 'خطای سرور.' });
    }
};

export const getAllCommentsAdmin = async (req: AuthRequest, res: Response) => {
    try {
        const comments = await Comment.find()
            .populate('user', 'name email')
            .populate('post', 'title')
            .sort({ createdAt: -1 }); 

        res.status(200).json({ success: true, data: comments });
    } catch (error) {
        res.status(500).json({ success: false, message: 'خطای سرور در دریافت نظرات.' });
    }
};