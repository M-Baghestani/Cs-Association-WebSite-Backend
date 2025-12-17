import {Router} from "express"
import {
    getGalleries,
    getGalleryById,
    createGallery,
    deleteGallery
} from "../controllers/gallery.controller"
import {protect, admin} from "../middlewares/auth.middleware"
import { create } from "domain"

const router = Router()

router.get('/',getGalleries)
router.get('/:id',getGalleryById)

router.post('/',createGallery)
router.delete('/:id',deleteGallery)

export default router;