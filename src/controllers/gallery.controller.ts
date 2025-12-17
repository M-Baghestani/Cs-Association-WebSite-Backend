import {Request,Response} from 'express'
import Gallery from '../models/Gallery'
import { AuthRequest } from '../middlewares/auth.middleware'

export const getGalleries = async (req: Request, res: Response) => {
    try {
        const galleries = await Gallery.find().sort({ createdAt: -1 });
        res.json({ success: true, data: galleries });
    } catch (error) {
        res.status(500).json({ success: false, message: 'خطا در دریافت گالری‌ها' });
    }
};
export const getGalleryById = async (req: Request, res: Response) => {
    try {
        const gallery = await Gallery.findById(req.params.id);
        if (!gallery) return res.status(404).json({ success: false, message: 'گزارش یافت نشد' });
        res.json({ success: true, data: gallery });
    } catch (error) {
        res.status(500).json({ success: false, message: 'خطای سرور' });
    }
};

export const createGallery = async(req:AuthRequest, res:Response) => {
    try {
        const {title, description, coverImage, images} = req.body;
        const gallery = await Gallery.create({
            title,description,coverImage,images
        })
        res.status(201).json({success:true,data: gallery})
    } catch (error) {
        res.status(500).json({success:false,message:"خطا در ثبت گالری"})
    }
}

export const deleteGallery = async(req:AuthRequest, res:Response) => {
    try {
        const gallery = await Gallery.findByIdAndDelete(req.params.id);
        if(!gallery) return res.status(404).json({success:false,message:"گالری یافت نشد"})
        res.json({success:true,message:"گالری با موفقیت حذف شد"})
    } catch (error) {
        res.status(500).json({success:false,message:"خطا در حذف"})
    }
}