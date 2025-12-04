import multer from 'multer';
import * as AWS from 'aws-sdk';
import multerS3 from 'multer-s3';

const S3_ENDPOINT = process.env.S3_ENDPOINT || 'https://storage.liara.space';
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || 'cs-association'; // نام باکت شما

const s3 = new AWS.S3({
  endpoint: new AWS.Endpoint(S3_ENDPOINT),
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  s3ForcePathStyle: true, // Liara نیاز به این دارد
});

const storage = multerS3({
    s3: s3 as any,
    bucket: S3_BUCKET_NAME,
    acl: 'public-read',
    key: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        // قرار دادن فایل‌ها در پوشه 'uploads'
        cb(null, 'uploads/' + uniqueSuffix + '-' + file.originalname);
    },
    // 🚨 FIX: تنظیم ContentDisposition و ContentType
    contentType: multerS3.AUTO_CONTENT_TYPE,
    contentDisposition: 'inline', // 🚨 FIX: نمایش فایل به جای دانلود اجباری
});

const fileFilter = (req: any, file: any, cb: any) => {
  if (
    file.mimetype.startsWith('image/') || 
    file.mimetype === 'application/pdf' 
  ) {
    cb(null, true);
  } else {
    cb(new Error('فقط فایل‌های تصویری و PDF مجاز هستند!'), false);
  }
};

export const upload = multer({ 
  storage: storage as any, 
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});