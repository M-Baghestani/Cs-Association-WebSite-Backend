import { Request, Response } from 'express';
import Journal from '../models/Journal';
import { AuthRequest } from '../middlewares/auth.middleware';

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
        if (!journal) return res.status(404).json({ success: false, message: 'نشریه یافت نشد.' });
        res.json({ success: true, data: journal });
    } catch (error) {
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