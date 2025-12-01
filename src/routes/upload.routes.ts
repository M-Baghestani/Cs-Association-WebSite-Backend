import { Router } from 'express';
import { upload } from '../middlewares/upload.middleware';
import { protect, admin } from '../middlewares/auth.middleware'; 

const router = Router();

router.post('/', protect, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'هیچ فایلی آپلود نشد' });
  }

  const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

  res.json({
    success: true,
    url: imageUrl 
  });
});

export default router;