// // // src/routes/event.routes.ts
// // import Registration from '../models/Registration';
// // import Event from '../models/Event';
// // import { Router } from 'express';
// // import { 
// //     getEvents, 
// //     registerForEvent, 
// //     getMyRegistrations, 
// //     getEventBySlug, 
// //     createEvent,
// //     updateEvent,
// //     getEventById,
// //     getRegistrationStatus,
// // } from '../controllers/event.controller'; 
// // import { protect, admin ,optionalAuth} from '../middlewares/auth.middleware';






// // const router = Router();

// // router.get('/', getEvents);
// // router.get('/my-registrations', protect, getMyRegistrations);

// // router.get('/slug/:slug', getEventBySlug); 

// // router.get('/:id', getEventById); 
// // router.post('/:id/register', protect, registerForEvent);
// // router.put('/:id', protect, admin, updateEvent);




// // router.get('/:slug/status', protect, getRegistrationStatus);
// // router.get('/slug/:slug', optionalAuth, getEventBySlug);


// // router.post('/', protect, admin, createEvent);
// // router.delete('/:id', protect, admin, async (req, res) => {
// //   try {
// //     const eventId = req.params.id;

// //     await Registration.deleteMany({ event: eventId });
    
// //     const result = await Event.findByIdAndDelete(eventId);

// //     if (!result) {
// //         return res.status(404).json({ success: false, message: 'رویداد برای حذف یافت نشد.' });
// //     }

// //     res.json({ success: true, message: 'رویداد و ثبت‌نام‌های مرتبط با موفقیت حذف شدند.' });
// //   } catch (error) {
// //     console.error("EVENT DELETION ERROR:", error); 
// //     res.status(500).json({ success: false, message: 'خطای سرور هنگام حذف رویداد.' });
// //   }
// // });



// // export default router;

// import { Router } from 'express';
// import { 
//     getEvents, registerForEvent, getMyRegistrations, getEventBySlug, 
//     createEvent, updateEvent, getEventById,
// } from '../controllers/event.controller'; 
// import { protect, admin, optionalAuth } from '../middlewares/auth.middleware'; 

// const router = Router();

// router.get('/', getEvents);
// router.get('/my-registrations', protect, getMyRegistrations);
// router.get('/slug/:slug', optionalAuth, getEventBySlug); 

// router.get('/:id', getEventById); 
// router.post('/:id/register', protect, registerForEvent);
// router.put('/:id', protect, admin, updateEvent);
// router.delete('/:id', protect, admin, (req, res) => { res.json({msg: "Delete unimplemented"}) }); // Placeholder
// router.post('/', protect, admin, createEvent);

// export default router;

// src/routes/events.routes.ts
import { Router } from 'express';
import { 
  getEvents,
  registerForEvent,
  getMyRegistrations,
  getEventBySlug,
  createEvent,
  updateEvent,
  getEventById,
  getRegistrationStatus,
  deleteEvent
} from '../controllers/event.controller';

import { protect, admin, optionalAuth } from '../middlewares/auth.middleware';

const router = Router();

// عمومی
router.get('/', getEvents);

// مسیرهای اسلاگ
router.get('/slug/:slug/status', optionalAuth, getRegistrationStatus);
router.get('/slug/:slug', optionalAuth, getEventBySlug);

// مسیرهای آیدی
router.get('/my-registrations', protect, getMyRegistrations);
router.get('/:id', getEventById);
router.post('/:id/register', protect, registerForEvent);
router.put('/:id', protect, admin, updateEvent);
router.delete('/:id', protect, admin, deleteEvent);

// ساخت رویداد
router.post('/', protect, admin, createEvent);

export default router;
