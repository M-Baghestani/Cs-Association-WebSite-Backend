import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export const JWT_SECRET_KEY = process.env.JWT_SECRET || "MY_SUPER_SECURE_FIXED_KEY_2025";