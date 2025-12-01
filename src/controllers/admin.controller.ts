import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware'; 
import User from '../models/User';
import Event from '../models/Event';
import Registration from '../models/Registration';
import Post from '../models/Post';
import Contact from '../models/Contact';


export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const [usersCount, eventsCount, registrationsCount, postsCount, messagesCount] = await Promise.all([
            User.countDocuments(),
            Event.countDocuments(),
            Registration.countDocuments(),
            Post.countDocuments(),
            Contact.countDocuments(),
        ]);

        res.status(200).json({ 
            success: true,
            stats: {
                users: usersCount,
                events: eventsCount,
                registrations: registrationsCount,
                posts: postsCount,
                messages: messagesCount
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'خطای سرور در آمارگیری' });
    }
};

export const getAdminRegistrations = async (req: Request, res: Response) => {
    try {
        const registrations = await Registration.find()
            .populate('user', 'name email studentId') 
            .populate('event', 'title price slug')         
            .sort({ registeredAt: -1 });
        
        res.status(200).json({ success: true, data: registrations });
    } catch (error) {
        console.error("Error fetching admin registrations:", error);
        res.status(500).json({ success: false, message: 'خطای سرور در لیست ثبت‌نام' });
    }
};

export const updateRegistrationStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { status } = req.body;
        
        const registration = await Registration.findByIdAndUpdate(
            req.params.id, 
            { status: status }, 
            { new: true, runValidators: true }
        );

        if (!registration) return res.status(404).json({ success: false, message: 'ثبت‌نام یافت نشد' });
        
        res.status(200).json({ success: true, message: `وضعیت به ${status} تغییر یافت.`, data: registration });

    } catch (error) {
        console.error("Error updating registration status:", error);
        res.status(500).json({ success: false, message: 'خطای سرور' });
    }
};