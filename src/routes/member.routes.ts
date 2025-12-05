import { Router, Request, Response } from 'express';
import Member from '../models/Member'; 
import { protect, admin } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
 try {
  const members = await Member.find().sort({ createdAt: 1 });
  res.json({ success: true, data: members });
 } catch (error) {
  res.status(500).json({ success: false, message: 'خطای سرور' });
 }
});

router.post('/', protect, admin, async (req: Request, res: Response) => {
 try {
  const member = await Member.create(req.body);
  res.status(201).json({ success: true, data: member });
 } catch (error) {
  res.status(400).json({ success: false, message: 'خطا در افزودن عضو' });
 }
});

export default router;