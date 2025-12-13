// src/controllers/admin.controller.ts
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
            .populate('event', 'title price')
            .sort({ createdAt: -1 });
        
        res.status(200).json({ success: true, data: registrations });
    } catch (error) {
        console.error("Error fetching admin registrations:", error);
        res.status(500).json({ success: false, message: 'خطای سرور در لیست ثبت‌نام' });
    }
};

export const updateRegistrationStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { status } = req.body; // status: 'APPROVED' | 'REJECTED'
        const registrationId = req.params.id;
        
        const registration = await Registration.findById(registrationId);
        if (!registration) {
            return res.status(404).json({ success: false, message: 'ثبت‌نام یافت نشد' });
        }

        if (registration.status === status) {
            return res.status(200).json({ success: true, data: registration });
        }

        const oldStatus = registration.status;

        registration.status = status;
        await registration.save();

        if (status === 'APPROVED' && oldStatus !== 'APPROVED') {
            await Event.findByIdAndUpdate(registration.event, { $inc: { registeredCount: 1 } });
        }
        else if (status === 'REJECTED' && oldStatus === 'APPROVED') {
            await Event.findByIdAndUpdate(registration.event, { $inc: { registeredCount: -1 } });
        }
        
        res.status(200).json({ 
            success: true, 
            message: `وضعیت به ${status === 'APPROVED' ? 'تایید شده' : 'رد شده'} تغییر یافت.`, 
            data: registration 
        });

    } catch (error) {
        console.error("Error updating registration status:", error);
        res.status(500).json({ success: false, message: 'خطای سرور' });
    }
};