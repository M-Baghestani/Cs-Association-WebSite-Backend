// src/routes/upload.route.ts
import { Router, Request, Response } from 'express';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { protect } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';
import { s3Client } from '../utils/s3';
import path from 'path';
import { GetObjectCommand } from '@aws-sdk/client-s3';

const router = Router();

interface MulterRequest extends Request {
    file?: Express.Multer.File;
}

export const downloadJournal = async (req: Request, res: Response) => {
    try {
        const { fileKey } = req.query;
        const bucketName = process.env.ARVAN_BUCKET_NAME!;

        // 1. لاگ برای دیباگ (حتماً در ترمینال چک کنید)
        console.log("--- Download Request ---");
        console.log("Raw Input:", fileKey);

        if (!fileKey || typeof fileKey !== 'string') {
            return res.status(400).json({ message: "لینک فایل نامعتبر است" });
        }

        let finalKey = fileKey;

        // 2. تمیزکاری هوشمند لینک
        if (fileKey.startsWith('http')) {
            try {
                const urlObj = new URL(fileKey);
                // گرفتن مسیر فایل (بدون دومین) و دیکد کردن (برای کاراکترهای فارسی و فاصله)
                let path = decodeURIComponent(urlObj.pathname);
                
                // حذف اسلش اول اگر باشد
                if (path.startsWith('/')) path = path.substring(1);

                // حذف نام باکت از اول مسیر (اینجاست که معمولا باگ میخورد)
                // اگر مسیر با اسم باکت شروع شده باشد، آن را حذف میکنیم
                if (path.startsWith(`${bucketName}/`)) {
                    path = path.replace(`${bucketName}/`, '');
                } else if (path.startsWith(bucketName)) { // شاید بدون اسلش باشد
                     path = path.replace(bucketName, '');
                }

                // حذف اسلش‌های اضافی احتمالی در شروع
                while (path.startsWith('/')) {
                    path = path.substring(1);
                }

                finalKey = path;
            } catch (e) {
                console.error("URL Parsing Error:", e);
                // اگر نتوانست پارس کند، شاید خودش Key خالص بوده، پس دست نمیزنیم
            }
        }

        console.log("Extracted Bucket:", bucketName);
        console.log("Final Key for S3:", finalKey);

        // 3. درخواست به S3
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: finalKey,
            // هدر اجبار به دانلود
            ResponseContentDisposition: `attachment; filename="${finalKey.split('/').pop()}"`,
        });

        const downloadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // ۱ ساعت اعتبار
        
        // ریدارکت به لینک دانلود
        res.redirect(downloadUrl);

    } catch (error: any) {
        console.error("Download Error Detail:", error);
        
        // اگر فایل پیدا نشد
        if (error.name === 'NoSuchKey') {
            return res.status(404).json({ message: "فایل مورد نظر در فضای ابری یافت نشد." });
        }

        res.status(500).json({ message: "خطا در تولید لینک دانلود" });
    }
};

const uploadToArvan = async (req: MulterRequest, res: Response): Promise<any> => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'فایلی آپلود نشد.' });
    }

    const bucketName = process.env.ARVAN_BUCKET_NAME!;
    const endpoint = process.env.ARVAN_ENDPOINT!; // مثلا https://s3.ir-tbz-sh1.arvanstorage.ir

    try {
        const fileExtension = path.extname(req.file.originalname);
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const fileName = `uploads/${uniqueSuffix}${fileExtension}`;

        const params = {
            Bucket: bucketName,
            Key: fileName,
            Body: req.file.buffer, 
            ContentType: req.file.mimetype,
            ACL: 'public-read' as const, 
        };

        await s3Client.send(new PutObjectCommand(params));

        const publicUrl = `${endpoint}/${bucketName}/${fileName}`;

        res.json({
            success: true,
            message: 'آپلود موفقیت‌آمیز بود',
            url: publicUrl
        });

    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ success: false, message: 'خطا در آپلود فایل به فضای ابری.' });
    }
};

const deleteFileFromS3 = async (req: Request, res: Response) => {
    const { url } = req.body;
    const bucketName = process.env.ARVAN_BUCKET_NAME!;

    if (!url) return res.status(400).json({ success: false, message: 'آدرس فایل ارسال نشده است.' });

    try {
        const urlObj = new URL(url);
        let fileKey = urlObj.pathname.substring(1);
        
        if (fileKey.startsWith(`${bucketName}/`)) {
            fileKey = fileKey.replace(`${bucketName}/`, '');
        }

        await s3Client.send(new DeleteObjectCommand({
            Bucket: bucketName,
            Key: fileKey,
        }));

        res.json({ success: true, message: 'فایل حذف شد.' });
    } catch (error) {
        console.error("S3 Delete Error:", error);
        res.status(500).json({ success: false, message: 'خطا در حذف فایل.' });
    }
};

router.get('/download', downloadJournal);
router.post('/', protect, upload.single('image'), uploadToArvan);
router.delete('/', protect, deleteFileFromS3);

export default router;