import { Request, Response } from 'express';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET_KEY } from '../config/secrets'; 
import { AuthRequest } from '../middlewares/auth.middleware';
import { OAuth2Client } from 'google-auth-library';




const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client();

export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password, phoneNumber } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'این ایمیل قبلا ثبت شده است' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const userData = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'student'
            
        });

        if (phoneNumber) userData.phoneNumber = phoneNumber;
        const user = await User.create(userData);

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
                    profileImage: user.profileImage, // Include new fields
                    dateOfBirth: user.dateOfBirth,     // Include new fields
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
                    profileImage: user.profileImage,
                    dateOfBirth: user.dateOfBirth,
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
        const { name, phoneNumber, password, profileImage, dateOfBirth, email } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'کاربر یافت نشد' });

        if (name) user.name = name;
        if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
        
        if (profileImage !== undefined) user.profileImage = profileImage;
        if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;


        if (password && password.trim().length > 0) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }
        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) return res.status(400).json({ success: false, message: 'این ایمیل قبلا توسط کاربر دیگری ثبت شده است.' });
            user.email = email; 
        }

        await user.save();

        res.json({ 
            success: true, 
            message: 'پروفایل بروزرسانی شد', 
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email, 
                role: user.role, 
                phoneNumber: user.phoneNumber || '',
                profileImage: user.profileImage,
                dateOfBirth: user.dateOfBirth,
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'خطای سرور در بروزرسانی پروفایل' });
    }
};


export const googleLogin = async (req: Request, res: Response) => {
    const { idToken } = req.body;

    if (!idToken || !GOOGLE_CLIENT_ID) {
        return res.status(400).json({ success: false, message: 'توکن نامعتبر یا Google Client ID تنظیم نشده است.' });
    }

    try {
        // 1. Verify the Google ID Token
        const ticket = await client.verifyIdToken({
            idToken: idToken,
            audience: [GOOGLE_CLIENT_ID]
        });
        const payload = ticket.getPayload();

        if (!payload || !payload.email) {
            return res.status(400).json({ success: false, message: 'توکن گوگل اطلاعات کافی ندارد.' });
        }

        const { sub: googleId, email, name, picture } = payload;

        // 2. Check if user exists by Google ID or Email
        let user = await User.findOne({ $or: [{ email }, { googleId }] });

        // 3. Register if user does not exist
        if (!user) {
            user = await User.create({
                email,
                name: name || 'کاربر گوگل',
                googleId,
                // Set a placeholder password since Mongoose requires it, but this user logs in via OAuth
                password: await bcrypt.hash(googleId + Date.now().toString(), 10), 
                role: 'student',
                profileImage: picture,
                phoneNumber: '',
            });
        } else if (!user.googleId) {
            // If user exists via email but without googleId, link the accounts
            user.googleId = googleId;
            user.profileImage = user.profileImage || picture; // Preserve existing image if available
            await user.save();
        }

        // 4. Issue local JWT
        const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, JWT_SECRET_KEY, { expiresIn: '30d' });

        // 5. Send successful response (similar structure to regular login)
        res.json({ success: true, data: { token, user: { id: user._id, name: user.name, email: user.email, role: user.role, phoneNumber: user.phoneNumber || '', profileImage: user.profileImage } } });

    } catch (error) {
        console.error("Google Login Error:", error);
        res.status(500).json({ success: false, message: 'خطا در احراز هویت گوگل' });
    }
};