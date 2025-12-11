// src/utils/s3.ts
import { S3Client } from '@aws-sdk/client-s3';

// اتصال به آروان کلاد با SDK نسخه 3
export const s3Client = new S3Client({
    region: 'default', // آروان به ریجن حساس نیست ولی default بگذارید
    endpoint: process.env.ARVAN_ENDPOINT, // مثلا: https://s3.ir-tbz-sh1.arvanstorage.ir
    credentials: {
        accessKeyId: process.env.ARVAN_ACCESS_KEY || '',
        secretAccessKey: process.env.ARVAN_SECRET_KEY || '',
    },
    forcePathStyle: true, // ⚠️ برای آروان این خط حیاتی است!
});