import { Router, Request, Response } from 'express'; 
import path from 'path';
import multer from 'multer';
import { protect } from '../middlewares/auth.middleware'; 
import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import multerS3 from 'multer-s3';

const router = Router();

const s3 = new S3Client({
    region: 'us-east-1',
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
    forcePathStyle: true,
});

// تعریف S3 Storage
const s3Storage = multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME || 'cs-default-bucket',
    acl: 'public-read', // اجازه دسترسی عمومی
    key: (req: any, file: any, cb: any) => {
        // نام فایل: (نوع فایل)/(زمان-عدد رندوم).(پسوند)
        const fileExtension = path.extname(file.originalname);
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExtension}`;
        cb(null, `uploads/${fileName}`);
    }
});


const deleteFileFromS3 = async (req: Request, res: Response) => {
    // در درخواست DELETE، داده‌ها در req.body ارسال می‌شوند
    const { url } = req.body; 
    
    if (!url || !url.includes(process.env.S3_BUCKET_NAME!)) {
        return res.status(400).json({ success: false, message: 'آدرس فایل نامعتبر است.' });
    }
    
    try {
        // استخراج نام فایل (Key) از URL ذخیره شده در دیتابیس
        const urlParts = new URL(url);
        // Key معمولاً شامل مسیر بعد از نام باکت است (مثلا /uploads/123.png)
        const Key = urlParts.pathname.substring(1); 

        // 1. ارسال دستور حذف به S3
        await s3.send(new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME!,
            Key: Key,
        }));

        res.json({ success: true, message: 'فایل با موفقیت از سرور حذف شد.' });
    } catch (error) {
        console.error("S3 Deletion Error:", error);
        res.status(500).json({ success: false, message: 'خطا در حذف فایل از فضای ابری.' });
    }
};

// تعریف Multer با S3 Storage
const upload = multer({ 
    storage: s3Storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter: (req: any, file: any, cb: any) => {
        if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('فقط فایل‌های تصویری و PDF مجاز هستند!'), false);
        }
    }
});


// ----------------------------------------------------
// روت آپلود فایل
// ----------------------------------------------------
router.post('/', protect, upload.single('image'), (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'هیچ فایلی آپلود نشد' }); 
    }

    // 🚨 FIX 3: لینک فایل مستقیماً از S3 می‌آید
    const uploadedFile = req.file as any;
    const imageUrl = uploadedFile.location; 

    res.json({
        success: true,
        url: imageUrl // این لینک مستقیم S3 است
    });
});

router.delete('/', protect, deleteFileFromS3);

export default router;