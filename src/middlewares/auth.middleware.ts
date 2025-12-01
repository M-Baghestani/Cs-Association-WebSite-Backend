import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
// 👇 ایمپورت کلید مرکزی
import { JWT_SECRET_KEY } from '../config/secrets';
import User from '../models/User';

export interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'دسترسی غیرمجاز. توکن یافت نشد.' });
    }

    try {
        // 🚨 FIX: استفاده از کلید مرکزی برای باز کردن توکن
        const decoded: any = jwt.verify(token, JWT_SECRET_KEY);
        
        // اطمینان از اینکه کاربر در دیتابیس وجود دارد
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({ success: false, message: 'کاربر این توکن دیگر وجود ندارد.' });
        }

        req.user = user; 
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'توکن نامعتبر است.' });
    }
};

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }

    if (token) {
        try {
            const decoded: any = jwt.verify(token, JWT_SECRET_KEY);
            const user = await User.findById(decoded.id).select('-password');
            if (user) {
                req.user = user;
            }
        } catch (error) {
            // توکن نامعتبر است، مهم نیست (چون اختیاری است)
        }
    }
    next();
};

export const admin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ success: false, message: 'دسترسی ادمین مجاز نیست.' });
    }
};