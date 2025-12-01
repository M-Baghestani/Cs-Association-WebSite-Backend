import { Request, Response } from 'express';
import Contact from '../models/Contact';
import { AuthRequest } from '../middlewares/auth.middleware';

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, subject, message } = req.body;
    const userId = req.user?.id || null;

    await Contact.create({ 
        user: userId,
        name, 
        email, 
        subject, 
        status: 'OPEN',
        messages: [{
            sender: 'USER',
            content: message,
            createdAt: new Date()
        }]
    });
    
    res.status(201).json({ success: true, message: 'تیکت شما ایجاد شد.' });
  } catch (error) {
    console.error("Contact error:", error);
    res.status(400).json({ success: false, message: 'خطا در ارسال پیام' });
  }
};

export const getMyMessages = async (req: AuthRequest, res: Response) => {
    try {
        const contacts = await Contact.find({ user: req.user.id }).sort({ updatedAt: -1 });
        res.json({ success: true, data: contacts });
    } catch (error) {
        res.status(500).json({ success: false, message: 'خطا در دریافت پیام‌ها' });
    }
};

export const getAllMessages = async (req: Request, res: Response) => {
    try {
        const contacts = await Contact.find().sort({ updatedAt: -1 });
        res.json({ success: true, data: contacts });
    } catch (error) {
        res.status(500).json({ success: false, message: 'خطای سرور' });
    }
};

export const replyToTicket = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { message } = req.body;
        const role = req.user.role === 'admin' ? 'ADMIN' : 'USER';

        const contact = await Contact.findById(id);
        if (!contact) return res.status(404).json({ success: false, message: 'تیکت یافت نشد' });

        if (contact.status === 'CLOSED') {
            return res.status(400).json({ success: false, message: 'این تیکت بسته شده است.' });
        }

        contact.messages.push({
            sender: role,
            content: message,
            createdAt: new Date()
        });

        await contact.save();
        res.json({ success: true, message: 'پاسخ ارسال شد.', data: contact });

    } catch (error) {
        res.status(500).json({ success: false, message: 'خطای سرور' });
    }
};

export const closeTicket = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        await Contact.findByIdAndUpdate(id, { status: 'CLOSED' });
        res.json({ success: true, message: 'تیکت بسته شد.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'خطای سرور' });
    }
};


export const editMessage = async (req: AuthRequest, res: Response) => {
    const { contactId, messageId } = req.params;
    const { newContent } = req.body;

    try {
        const contact = await Contact.findById(contactId);
        if (!contact) return res.status(404).json({ success: false, message: 'تیکت یافت نشد.' });

        if (contact.status === 'CLOSED') {
            return res.status(400).json({ success: false, message: 'این تیکت بسته شده و قابل ویرایش نیست.' });
        }

        const message = (contact.messages as any).id(messageId);
        
        if (!message) {
            return res.status(404).json({ success: false, message: 'پیام یافت نشد.' });
        }

        // آپدیت محتوا
        message.content = newContent;
        await contact.save();

        res.json({ success: true, message: 'پیام ویرایش شد.', data: contact });

    } catch (error) {
        console.error("Edit Error:", error);
        res.status(500).json({ success: false, message: 'خطای سرور.' });
    }
};