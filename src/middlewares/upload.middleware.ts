// src/middlewares/upload.middleware.ts
import multer from 'multer';

// فایل داخل رم ذخیره شود (نه دیسک، نه مستقیم S3)
const storage = multer.memoryStorage();

const fileFilter = (req: any, file: any, cb: any) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('فقط فایل‌های تصویری و PDF مجاز هستند!'), false);
    }
};

export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 },
});