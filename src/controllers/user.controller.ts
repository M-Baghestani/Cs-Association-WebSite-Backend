// src/controllers/user.controller.ts

import { Response } from 'express';
import User from '../models/User';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getUsers = async (req: AuthRequest, res: Response) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'دسترسی ادمین مورد نیاز است.' });
        }

        const users = await User.find().select('-password').sort({ createdAt: -1 });

        const transformedUsers = users.map(user => ({
            _id: user._id,
            username: user.name, 
            email: user.email,
            role: user.role,
            isVerified: true, 
            createdAt: user.createdAt, 
            phoneNumber: user.phoneNumber
        }));

        res.status(200).json({ success: true, data: transformedUsers });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ success: false, message: 'خطا در دریافت لیست کاربران.' });
    }
};