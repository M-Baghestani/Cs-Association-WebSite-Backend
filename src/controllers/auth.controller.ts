import { Request, Response } from 'express';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
// 👇 ایمپورت کلید از فایل مرکزی
import { JWT_SECRET_KEY } from '../config/secrets'; 
import { AuthRequest } from '../middlewares/auth.middleware';

export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password, phoneNumber } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'این ایمیل قبلا ثبت شده است' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            phoneNumber: phoneNumber || '',
            role: 'student' // نقش پیش‌فرض
        });

        // 🚨 FIX: استفاده از کلید مرکزی برای امضای توکن
        const token = jwt.sign(
            { id: user._id, role: user.role, name: user.name }, 
            JWT_SECRET_KEY, 
            { expiresIn: '30d' }
        );

        res.status(201).json({
            success: true,
            data: { 
                token, 
                user: { 
                    id: user._id, 
                    name: user.name, 
                    email: user.email,
                    role: user.role, 
                    phoneNumber: user.phoneNumber || '' 
                } 
            },
        });

    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ success: false, message: 'خطای سرور در ثبت نام' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: 'ایمیل یا رمز عبور اشتباه است' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'ایمیل یا رمز عبور اشتباه است' });
        }

        // 🚨 FIX: استفاده از کلید مرکزی
        const token = jwt.sign(
            { id: user._id, role: user.role, name: user.name }, 
            JWT_SECRET_KEY, 
            { expiresIn: '30d' }
        );

        res.json({
            success: true,
            data: { 
                token, 
                user: { 
                    id: user._id, 
                    name: user.name, 
                    email: user.email, 
                    role: user.role,
                    phoneNumber: user.phoneNumber || '' 
                } 
            },
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: 'خطای سرور در ورود' });
    }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const { name, phoneNumber, password } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'کاربر یافت نشد' });

        if (name) user.name = name;
        if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
        
        if (password && password.trim().length > 0) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        await user.save();

        res.json({ 
            success: true, 
            message: 'پروفایل بروزرسانی شد', 
            user: { id: user._id, name: user.name, email: user.email, role: user.role, phoneNumber: user.phoneNumber || '' } 
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'خطای سرور در بروزرسانی پروفایل' });
    }
};