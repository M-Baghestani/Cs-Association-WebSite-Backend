import { Request, Response } from 'express';
import Journal from '../models/Journal';
import { AuthRequest } from '../middlewares/auth.middleware';
// ایمپورت‌های جدید برای S3
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from '../utils/s3'; // مطمئن شو مسیر s3 درست است

// --- تابع جدید برای دانلود ---
export const downloadJournal = async (req: Request, res: Response) => {
    try {
        const { fileKey } = req.query;
        const bucketName = process.env.ARVAN_BUCKET_NAME!;

        if (!fileKey || typeof fileKey !== 'string') {
            return res.status(400).json({ message: "لینک فایل نامعتبر است" });
        }

        let finalKey = fileKey;

        // تمیزکاری لینک و استخراج Key خالص
        if (fileKey.startsWith('http')) {
            try {
                const urlObj = new URL(fileKey);
                let path = decodeURIComponent(urlObj.pathname);
                
                if (path.startsWith('/')) path = path.substring(1);

                // حذف نام باکت از مسیر (بسیار مهم برای آروان)
                if (path.startsWith(`${bucketName}/`)) {
                    path = path.replace(`${bucketName}/`, '');
                } else if (path.startsWith(bucketName)) {
                     path = path.replace(bucketName, '');
                }
                while (path.startsWith('/')) path = path.substring(1);

                finalKey = path;
            } catch (e) {
                console.error("URL Parsing Error", e);
            }
        }

        console.log("Downloading Key:", finalKey);

        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: finalKey,
            // این هدر باعث می‌شود مرورگر فایل را دانلود کند (باز نکند)
            ResponseContentDisposition: `attachment; filename="${finalKey.split('/').pop()}"`,
        });

        // تولید لینک موقت (1 ساعت اعتبار)
        const downloadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        
        // کاربر را به لینک دانلود هدایت می‌کنیم
        res.redirect(downloadUrl);

    } catch (error) {
        console.error("Download Error:", error);
        res.status(500).json({ success: false, message: 'خطا در تولید لینک دانلود' });
    }
};

// --- بقیه توابع شما (بدون تغییر) ---

export const getJournals = async (req: Request, res: Response) => {
    try {
        const journals = await Journal.find().sort({ editionNumber: -1 });
        res.json({ success: true, data: journals });
    } catch (error) {
        res.status(500).json({ success: false, message: 'خطای سرور' });
    }
};

export const getJournalById = async (req: Request, res: Response) => {
    try {
        const journal = await Journal.findById(req.params.id);
        
        if (!journal) {
            return res.status(404).json({ success: false, message: 'نشریه یافت نشد.' });
        }
        
        res.json({ success: true, data: journal });
    } catch (error: any) { 
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            // اگر ID معتبر نبود (مثلا اگر اشتباها download به اینجا برسد)
            return res.status(404).json({ success: false, message: 'نشریه یافت نشد.' });
        }
        res.status(500).json({ success: false, message: 'خطای سرور' });
    }
};

export const createJournal = async (req: AuthRequest, res: Response) => {
    try {
        const { title, editionNumber, coverImage, pdfUrl } = req.body;
        const journal = await Journal.create({ title, editionNumber, coverImage, pdfUrl });
        res.status(201).json({ success: true, data: journal });
    } catch (error) {
        res.status(500).json({ success: false, message: 'خطا در ایجاد نشریه' });
    }
};

export const deleteJournal = async (req: AuthRequest, res: Response) => {
    try {
        await Journal.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'حذف شد.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'خطای سرور' });
    }
};