// // // import { Request, Response } from 'express';
// // // import Event from '../models/Event';
// // // import Registration from '../models/Registration';
// // // import User from '../models/User';
// // // import { AuthRequest } from '../middlewares/auth.middleware';

// // // export const getEvents = async (req: Request, res: Response) => {
// // //     try {
// // //         const events = await Event.find().sort({ date: 1 }).lean();

// // //         const eventsWithRealCount = await Promise.all(events.map(async (event) => {
// // //             const realCount = await Registration.countDocuments({
// // //                 event: event._id,
// // //                 status: { $in: ['VERIFIED', 'PENDING'] }
// // //             });
// // //             return { ...event, registeredCount: realCount };
// // //         }));

// // //         res.status(200).json({ success: true, count: eventsWithRealCount.length, data: eventsWithRealCount });
// // //     } catch (error) {
// // //         console.error("Error fetching events:", error);
// // //         res.status(500).json({ success: false, message: 'خطای سرور' });
// // //     }
// // // };

// // // export const getEventBySlug = async (req: AuthRequest, res: Response) => {
// // //     const { slug } = req.params;
// // //     const userId = req.user?._id;

// // //     try {
// // //         const event = await Event.findOne({ slug });
// // //         if (!event) return res.status(404).json({ success: false, message: 'رویداد یافت نشد.' });

// // //         let eventData: any = event.toObject();

// // //         const realCount = await Registration.countDocuments({
// // //             event: event._id,
// // //             status: { $in: ['VERIFIED', 'PENDING'] }
// // //         });
// // //         eventData.registeredCount = realCount;

// // //         if (userId) {
// // //             const userRegistration = await Registration.findOne({ event: event._id, user: userId })
// // //                 .select('status pricePaid trackingCode');

// // //             eventData.userRegistration = userRegistration;
// // //         }

// // //         res.status(200).json({ success: true, data: eventData });

// // //     } catch (error) {
// // //         console.error("Error fetching event by slug:", error);
// // //         res.status(500).json({ success: false, message: 'خطای سرور' });
// // //     }
// // // };

// // // export const registerForEvent = async (req: AuthRequest, res: Response) => {
// // //     const { id } = req.params;
// // //     // 👇 FIX: خواندن 'id' از req.user به جای '_id'
// // //     const userId = req.user.id;
// // //     const { pricePaid, trackingCode, receiptImage } = req.body;

// // //     try {
// // //         const event = await Event.findById(id);
// // //         if (!event) return res.status(404).json({ success: false, message: 'رویداد پیدا نشد.' });

// // //         const registrationsCount = await Registration.countDocuments({ event: id, status: { $in: ['VERIFIED', 'PENDING'] } });
// // //         if (registrationsCount >= event.capacity) {
// // //             return res.status(400).json({ success: false, message: 'ظرفیت رویداد تکمیل شده است.' });
// // //         }

// // //         const existingReg = await Registration.findOne({
// // //             event: id,
// // //             user: userId,
// // //             status: { $in: ['VERIFIED', 'PENDING'] }
// // //         });

// // //         if (existingReg) {
// // //             return res.status(400).json({
// // //                 success: false,
// // //                 message: existingReg.status === 'VERIFIED'
// // //                     ? 'شما قبلاً ثبت‌نام تأیید شده در این رویداد دارید.'
// // //                     : 'درخواست ثبت‌نام شما در انتظار تأیید است.'
// // //             });
// // //         }

// // //         let priceToStore = pricePaid ?? event.price;
// // //         let newStatus = event.isFree ? 'VERIFIED' : 'PENDING';

// // //         const registration = await Registration.create({
// // //             user: userId,
// // //             event: id,
// // //             status: newStatus,
// // //             pricePaid: priceToStore,
// // //             trackingCode: trackingCode || null,
// // //             receiptImage: receiptImage || null,
// // //             registeredAt: new Date(),
// // //         });

// // //         if (newStatus === 'VERIFIED') {
// // //              await Event.findByIdAndUpdate(id, { $inc: { registeredCount: 1 } });
// // //         }

// // //         const message = event.isFree
// // //             ? 'ثبت‌نام با موفقیت انجام شد.'
// // //             : 'درخواست ثبت‌نام شما ثبت شد و منتظر تأیید پرداخت بمانید.';

// // //         return res.status(200).json({ success: true, message, registration });

// // //     } catch (error: any) {
// // //         console.error('Registration Error:', error);
// // //         return res.status(500).json({ success: false, message: 'خطای داخلی سرور هنگام ثبت‌نام.' });
// // //     }
// // // };

// // // export const createEvent = async (req: AuthRequest, res: Response) => {
// // //     try {
// // //         const { title, slug, description, date, location, capacity, isFree, price, thumbnail } = req.body;

// // //         const event = await Event.create({
// // //             title,
// // //             slug,
// // //             description,
// // //             date,
// // //             location,
// // //             capacity,
// // //             isFree,
// // //             price,
// // //             thumbnail,
// // //             creator: req.user._id
// // //         });

// // //         return res.status(201).json({
// // //             success: true,
// // //             message: "رویداد با موفقیت ساخته شد.",
// // //             eventId: event._id
// // //         });

// // //     } catch (error: any) {
// // //         console.error("Error creating event:", error);
// // //         if (error.code === 11000) {
// // //             return res.status(400).json({ success: false, message: 'این آدرس (Slug) قبلا استفاده شده است.' });
// // //         }
// // //         return res.status(500).json({ success: false, message: 'خطای داخلی سرور هنگام ایجاد رویداد.' });
// // //     }
// // // };

// // // export const getEventById = async (req: Request, res: Response) => {
// // //     try {
// // //         const event = await Event.findById(req.params.id);
// // //         if (!event) return res.status(404).json({ success: false, message: 'رویداد یافت نشد' });
// // //         res.status(200).json({ success: true, data: event });
// // //     } catch (error) {
// // //         res.status(500).json({ success: false, message: 'خطای سرور' });
// // //     }
// // // };

// // // export const updateEvent = async (req: Request, res: Response) => {
// // //     try {
// // //         const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
// // //             new: true,
// // //             runValidators: true
// // //         });

// // //         if (!event) return res.status(404).json({ success: false, message: 'رویداد یافت نشد' });

// // //         res.status(200).json({ success: true, data: event, message: 'رویداد ویرایش شد' });
// // //     } catch (error) {
// // //         res.status(500).json({ success: false, message: 'خطای سرور' });
// // //     }
// // // };

// // // export const getMyRegistrations = async (req: AuthRequest, res: Response) => {
// // //     try {

// // //         const registrations = await Registration.find({ user: req.user._id })
// // //             .populate('event', 'title date location slug thumbnail');

// // //         res.status(200).json({ success: true, data: registrations });

// // //     } catch (error) {
// // //         console.error("Error in getMyRegistrations:", error);
// // //         res.status(500).json({ success: false, message: 'خطای سرور' });
// // //     }
// // // };

// // // export const getRegistrationStatus = async (req: AuthRequest, res: Response) => {
// // //     // 🚨 توجه: این تابع برای کار کردن نیاز به slug رویداد و لاگین بودن کاربر دارد.
// // //     const { slug } = req.params;
// // //     const userId = req.user?.id; // مطمئن شوید که id یا _id را درست می‌خوانید

// // //     if (!userId) {
// // //          // اگر کاربر لاگین نیست، وضعیت ثبت نامی هم ندارد
// // //          return res.status(200).json({ success: true, isRegistered: false, status: null });
// // //     }

// // //     try {
// // //         const event = await Event.findOne({ slug }).select('_id');
// // //         if (!event) {
// // //             return res.status(404).json({ success: false, message: 'رویداد پیدا نشد.' });
// // //         }

// // //         // پیدا کردن رکورد ثبت نام برای این کاربر و این رویداد
// // //         const registration = await Registration.findOne({
// // //             user: userId,
// // //             event: event._id,
// // //             status: { $in: ['PENDING', 'VERIFIED', 'FAILED'] }
// // //         })
// // //         .select('status pricePaid trackingCode'); // فقط فیلدهای مورد نیاز

// // //         if (!registration) {
// // //             return res.status(200).json({ success: true, isRegistered: false, status: null });
// // //         }

// // //         // اگر ثبت‌نامی پیدا شد، وضعیت آن را برمی‌گردانیم
// // //         return res.status(200).json({
// // //             success: true,
// // //             isRegistered: true,
// // //             status: registration.status,
// // //             data: registration
// // //         });

// // //     } catch (error) {
// // //         console.error('Error fetching registration status:', error);
// // //         return res.status(500).json({ success: false, message: 'خطای داخلی سرور هنگام بررسی وضعیت ثبت‌نام.' });
// // //     }
// // // };

// // import { Request, Response } from 'express';
// // import Event from '../models/Event';
// // import Registration from '../models/Registration';
// // import User from '../models/User';
// // import { AuthRequest } from '../middlewares/auth.middleware';

// // // دریافت لیست رویدادها
// // export const getEvents = async (req: Request, res: Response) => {
// //     try {
// //         const events = await Event.find().sort({ date: 1 }).lean();

// //         const eventsWithRealCount = await Promise.all(events.map(async (event) => {
// //             const realCount = await Registration.countDocuments({
// //                 event: event._id,
// //                 status: { $in: ['VERIFIED', 'PENDING'] }
// //             });
// //             return { ...event, registeredCount: realCount };
// //         }));

// //         res.status(200).json({ success: true, count: eventsWithRealCount.length, data: eventsWithRealCount });
// //     } catch (error) {
// //         console.error("Error fetching events:", error);
// //         res.status(500).json({ success: false, message: 'خطای سرور' });
// //     }
// // };

// // // دریافت تکی با اسلاگ (همراه با وضعیت کاربر)
// // export const getEventBySlug = async (req: AuthRequest, res: Response) => {
// //     const { slug } = req.params;
// //     const userId = req.user?._id;

// //     try {
// //         const event = await Event.findOne({ slug });
// //         if (!event) return res.status(404).json({ success: false, message: 'رویداد یافت نشد.' });

// //         let eventData: any = event.toObject();

// //         // محاسبه ظرفیت پر شده
// //         const realCount = await Registration.countDocuments({
// //             event: event._id,
// //             status: { $in: ['VERIFIED', 'PENDING'] }
// //         });
// //         eventData.registeredCount = realCount;

// //         // اگر کاربر لاگین است، وضعیت ثبت‌نامش را پیدا کن
// //         if (userId) {
// //             const userRegistration = await Registration.findOne({
// //                 event: event._id,
// //                 user: userId
// //             }).select('status pricePaid trackingCode');

// //             eventData.userRegistration = userRegistration ? userRegistration.toObject() : null;
// //         } else {
// //              eventData.userRegistration = null;
// //         }

// //         res.status(200).json({ success: true, data: eventData });

// //     } catch (error) {
// //         console.error("Error fetching event by slug:", error);
// //         res.status(500).json({ success: false, message: 'خطای سرور' });
// //     }
// // };

// // // ثبت نام و ارسال رسید
// // export const registerForEvent = async (req: AuthRequest, res: Response) => {
// //     const { id } = req.params;
// //     const userId = req.user.id;

// //     // دریافت داده‌های پرداخت
// //     const { pricePaid, trackingCode, receiptImage } = req.body;

// //     try {
// //         const event = await Event.findById(id);
// //         if (!event) return res.status(404).json({ success: false, message: 'رویداد پیدا نشد.' });

// //         // بررسی ظرفیت
// //         const registrationsCount = await Registration.countDocuments({ event: id, status: { $in: ['VERIFIED', 'PENDING'] } });
// //         if (registrationsCount >= event.capacity) {
// //             return res.status(400).json({ success: false, message: 'ظرفیت رویداد تکمیل شده است.' });
// //         }

// //         // جلوگیری از ثبت‌نام تکراری (فقط اگر قبلاً تایید شده باشد)
// //         const existingReg = await Registration.findOne({
// //             event: id,
// //             user: userId,
// //             status: 'VERIFIED'
// //         });

// //         if (existingReg) {
// //             return res.status(400).json({ success: false, message: 'شما قبلاً در این رویداد ثبت‌نام قطعی کرده‌اید.' });
// //         }

// //         let priceToStore = pricePaid ?? event.price;
// //         let newStatus = event.isFree ? 'VERIFIED' : 'PENDING';

// //         // استفاده از findOneAndUpdate با upsert برای جلوگیری از خطای تکراری
// //         const registration = await Registration.findOneAndUpdate(
// //             { user: userId, event: id },
// //             {
// //                 status: newStatus,
// //                 pricePaid: priceToStore,
// //                 trackingCode: trackingCode || null,
// //                 receiptImage: receiptImage || null,
// //                 registeredAt: new Date(),
// //             },
// //             { new: true, upsert: true, runValidators: true }
// //         );

// //         if (newStatus === 'VERIFIED') {
// //              await Event.findByIdAndUpdate(id, { $inc: { registeredCount: 1 } });
// //         }

// //         const message = event.isFree
// //             ? 'ثبت‌نام با موفقیت انجام شد.'
// //             : 'درخواست شما ثبت شد. منتظر تأیید پرداخت باشید.';

// //         return res.status(200).json({ success: true, message, registration });

// //     } catch (error: any) {
// //         console.error('Registration Error:', error);
// //         return res.status(500).json({ success: false, message: 'خطای داخلی سرور هنگام ثبت‌نام.' });
// //     }
// // };

// // // توابع دیگر (تغییر نکرده‌اند ولی باید باشند)
// // export const createEvent = async (req: AuthRequest, res: Response) => {
// //     try {
// //         const { title, slug, description, date, location, capacity, isFree, price, thumbnail } = req.body;
// //         const event = await Event.create({ title, slug, description, date, location, capacity, isFree, price, thumbnail, creator: req.user._id });
// //         return res.status(201).json({ success: true, message: "رویداد ساخته شد.", eventId: event._id });
// //     } catch (error: any) {
// //         if (error.code === 11000) return res.status(400).json({ success: false, message: 'اسلاگ تکراری است.' });
// //         return res.status(500).json({ success: false, message: 'خطا در ساخت رویداد.' });
// //     }
// // };

// // export const getEventById = async (req: Request, res: Response) => {
// //     try {
// //         const event = await Event.findById(req.params.id);
// //         if (!event) return res.status(404).json({ success: false, message: 'رویداد یافت نشد' });
// //         res.status(200).json({ success: true, data: event });
// //     } catch (error) { res.status(500).json({ success: false, message: 'خطا' }); }
// // };

// // export const updateEvent = async (req: Request, res: Response) => {
// //     try {
// //         const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
// //         if (!event) return res.status(404).json({ success: false, message: 'رویداد یافت نشد' });
// //         res.status(200).json({ success: true, data: event, message: 'ویرایش شد' });
// //     } catch (error) { res.status(500).json({ success: false, message: 'خطا' }); }
// // };

// // export const getMyRegistrations = async (req: AuthRequest, res: Response) => {
// //     try {
// //         const registrations = await Registration.find({ user: req.user._id }).populate('event', 'title date location slug thumbnail');
// //         res.status(200).json({ success: true, data: registrations });
// //     } catch (error) { res.status(500).json({ success: false, message: 'خطا' }); }
// // };

// import { Request, Response } from 'express';
// import Event from '../models/Event';
// import Registration from '../models/Registration';
// import User from '../models/User';
// import { AuthRequest } from '../middlewares/auth.middleware';

// // 1. دریافت لیست رویدادها
// export const getEvents = async (req: Request, res: Response) => {
//     try {
//         const events = await Event.find().sort({ date: 1 }).lean();

//         const eventsWithRealCount = await Promise.all(events.map(async (event) => {
//             const realCount = await Registration.countDocuments({
//                 event: event._id,
//                 status: { $in: ['VERIFIED', 'PENDING'] }
//             });
//             return { ...event, registeredCount: realCount };
//         }));

//         res.status(200).json({ success: true, count: eventsWithRealCount.length, data: eventsWithRealCount });
//     } catch (error) {
//         console.error("Error fetching events:", error);
//         res.status(500).json({ success: false, message: 'خطای سرور' });
//     }
// };

// // 2. دریافت رویداد با SLUG
// export const getEventBySlug = async (req: AuthRequest, res: Response) => {
//     const { slug } = req.params;
//     const userId = req.user?._id;

//     try {
//         const event = await Event.findOne({ slug });
//         if (!event) return res.status(404).json({ success: false, message: 'رویداد یافت نشد.' });

//         let eventData: any = event.toObject();

//         const realCount = await Registration.countDocuments({
//             event: event._id,
//             status: { $in: ['VERIFIED', 'PENDING'] }
//         });
//         eventData.registeredCount = realCount;

//         if (userId) {
//             const userRegistration = await Registration.findOne({ event: event._id, user: userId })
//                 .select('status pricePaid trackingCode');

//             eventData.userRegistration = userRegistration ? userRegistration.toObject() : null;
//         } else {
//              eventData.userRegistration = null;
//         }

//         res.status(200).json({ success: true, data: eventData });

//     } catch (error: any) {
//         console.error("Error fetching event by slug:", error);
//         res.status(500).json({ success: false, message: 'خطای سرور' });
//     }
// };

// // 3. ثبت‌نام در رویداد
// export const registerForEvent = async (req: AuthRequest, res: Response) => {
//     const { id } = req.params;
//     const userId = req.user.id;
//     const { pricePaid, trackingCode, receiptImage } = req.body;

//     try {
//         const event = await Event.findById(id);
//         if (!event) return res.status(404).json({ success: false, message: 'رویداد پیدا نشد.' });

//         const registrationsCount = await Registration.countDocuments({ event: id, status: { $in: ['VERIFIED', 'PENDING'] } });
//         if (registrationsCount >= event.capacity) {
//             return res.status(400).json({ success: false, message: 'ظرفیت رویداد تکمیل شده است.' });
//         }

//         const existingReg = await Registration.findOne({
//             event: id,
//             user: userId,
//             status: { $in: ['VERIFIED', 'PENDING'] }
//         });

//         if (existingReg) {
//             return res.status(400).json({
//                 success: false,
//                 message: existingReg.status === 'VERIFIED'
//                     ? 'شما قبلاً ثبت‌نام تأیید شده در این رویداد دارید.'
//                     : 'درخواست ثبت‌نام شما در انتظار تأیید است.'
//             });
//         }

//         let priceToStore = pricePaid ?? event.price;
//         let newStatus = event.isFree ? 'VERIFIED' : 'PENDING';

//         const registration = await Registration.create({
//             user: userId,
//             event: id,
//             status: newStatus,
//             pricePaid: priceToStore,
//             trackingCode: trackingCode || null,
//             receiptImage: receiptImage || null,
//             registeredAt: new Date(),
//         });

//         if (newStatus === 'VERIFIED') {
//              await Event.findByIdAndUpdate(id, { $inc: { registeredCount: 1 } });
//         }

//         const message = event.isFree
//             ? 'ثبت‌نام با موفقیت انجام شد.'
//             : 'درخواست ثبت‌نام شما ثبت شد و منتظر تأیید پرداخت بمانید.';

//         return res.status(200).json({ success: true, message, registration });

//     } catch (error: any) {
//         console.error('Registration Error:', error);
//         return res.status(500).json({ success: false, message: 'خطای داخلی سرور هنگام ثبت‌نام.' });
//     }
// };

// // 4. ایجاد رویداد جدید
// export const createEvent = async (req: AuthRequest, res: Response) => {
//     try {
//         const { title, slug, description, date, location, capacity, isFree, price, thumbnail } = req.body;

//         const event = await Event.create({
//             title,
//             slug,
//             description,
//             date,
//             location,
//             capacity,
//             isFree,
//             price,
//             thumbnail,
//             creator: req.user._id
//         });

//         return res.status(201).json({
//             success: true,
//             message: "رویداد با موفقیت ساخته شد.",
//             eventId: event._id
//         });

//     } catch (error: any) {
//         console.error("Error creating event:", error);
//         if (error.code === 11000) {
//             return res.status(400).json({ success: false, message: 'این آدرس (Slug) قبلا استفاده شده است.' });
//         }
//         return res.status(500).json({ success: false, message: 'خطای داخلی سرور هنگام ایجاد رویداد.' });
//     }
// };

// // 5. دریافت رویداد با ID
// export const getEventById = async (req: Request, res: Response) => {
//     try {
//         const event = await Event.findById(req.params.id);
//         if (!event) return res.status(404).json({ success: false, message: 'رویداد یافت نشد' });
//         res.status(200).json({ success: true, data: event });
//     } catch (error) {
//         res.status(500).json({ success: false, message: 'خطای سرور' });
//     }
// };

// // 6. ویرایش رویداد
// export const updateEvent = async (req: Request, res: Response) => {
//     try {
//         const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
//             new: true,
//             runValidators: true
//         });

//         if (!event) return res.status(404).json({ success: false, message: 'رویداد یافت نشد' });

//         res.status(200).json({ success: true, data: event, message: 'رویداد ویرایش شد' });
//     } catch (error) {
//         res.status(500).json({ success: false, message: 'خطا در ویرایش' });
//     }
// };

// export const getMyRegistrations = async (req: AuthRequest, res: Response) => {
//     try {
//         const userId = req.user.id;

//         const registrations = await Registration.find({ user: userId })
//             .populate('event', 'title date location slug thumbnail')
//             .sort({ registeredAt: -1 });

//         res.status(200).json({ success: true, data: registrations });

//     } catch (error) {
//         console.error("Error in getMyRegistrations:", error);
//         res.status(500).json({ success: false, message: 'خطای سرور' });
//     }
// };

// // 8. دریافت وضعیت ثبت نام (برای روت جداگانه)
// export const getRegistrationStatus = async (req: AuthRequest, res: Response) => {
//     const { slug } = req.params;
//     const userId = req.user?.id;

//     if (!userId) {
//          return res.status(200).json({ success: true, isRegistered: false, status: null });
//     }

//     try {
//         const event = await Event.findOne({ slug }).select('_id');
//         if (!event) {
//             return res.status(404).json({ success: false, message: 'رویداد پیدا نشد.' });
//         }

//         const registration = await Registration.findOne({
//             user: userId,
//             event: event._id,
//             status: { $in: ['PENDING', 'VERIFIED', 'FAILED'] }
//         })
//         .select('status pricePaid trackingCode');

//         if (!registration) {
//             return res.status(200).json({ success: true, isRegistered: false, status: null });
//         }

//         return res.status(200).json({
//             success: true,
//             isRegistered: true,
//             status: registration.status,
//             data: registration
//         });

//     } catch (error) {
//         console.error('Error fetching registration status:', error);
//         return res.status(500).json({ success: false, message: 'خطای داخلی سرور' });
//     }
// };

// // 🚨 FIX: 9. حذف رویداد (Delete Event) - جدید و کامل
// export const deleteEvent = async (req: AuthRequest, res: Response) => {
//     try {
//         const eventId = req.params.id;

//         // اول چک کن رویداد هست یا نه
//         const event = await Event.findById(eventId);
//         if (!event) {
//             return res.status(404).json({ success: false, message: 'رویداد یافت نشد.' });
//         }

//         // 1. حذف تمام ثبت‌نام‌های مربوط به این رویداد (پاکسازی)
//         await Registration.deleteMany({ event: eventId });

//         // 2. حذف خود رویداد
//         await Event.findByIdAndDelete(eventId);

//         res.json({ success: true, message: 'رویداد و تمام ثبت‌نام‌های آن با موفقیت حذف شدند.' });
//     } catch (error) {
//         console.error("Delete Event Error:", error);
//         res.status(500).json({ success: false, message: 'خطا در حذف رویداد.' });
//     }
// };

// export const uploadReceipt = async (req: any, res: Response) => {
//     const { id: eventId } = req.params;
//     const userId = req.user._id; // از میدل‌ویر protect می‌آید

//     // 1. بررسی وجود فایل
//     if (!req.file) {
//         return res.status(400).json({ success: false, message: 'فایل رسید موجود نیست.' });
//     }

//     // 2. ساخت URL فایل آپلود شده
//     // فرض می‌کنیم میدل‌ویر آپلود، فایل را در uploads/ ذخیره کرده است
//     const receiptUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

//     try {
//         // 3. پیدا کردن و به‌روزرسانی ثبت‌نام
//         const registration = await Registration.findOneAndUpdate(
//             { user: userId, event: eventId },
//             {
//                 receiptImage: receiptUrl,
//                 status: 'RECEIPT_PENDING' // 👈 تنظیم وضعیت به "در حال تایید ادمین"
//             },
//             { new: true } // برای دریافت سند به‌روزرسانی شده
//         );

//         if (!registration) {
//             return res.status(404).json({ success: false, message: 'ثبت‌نام برای این رویداد یافت نشد.' });
//         }

//         res.json({
//             success: true,
//             message: 'رسید با موفقیت ارسال شد و در انتظار تأیید ادمین است.',
//             registration: registration // ارسال شیء ثبت‌نام جدید
//         });

//     } catch (error: any) {
//         console.error('Error uploading receipt:', error);
//         res.status(500).json({ success: false, message: 'خطای سرور در آپلود رسید.' });
//     }
// };

// import { Request, Response } from 'express';
// import Event from '../models/Event';
// import Registration from '../models/Registration';
// import User from '../models/User';
// import { AuthRequest } from '../middlewares/auth.middleware';
// import path from 'path'; // برای ساخت مسیر آپلود رسید

// export const getEvents = async (req: Request, res: Response) => {
//     try {
//         const now = new Date();

//         await Event.updateMany(
//             {
//                 registrationStatus: 'SCHEDULED',
//                 registrationOpensAt: { $lte: now }
//             },
//             { registrationStatus: 'OPEN' }
//         );

//         const events = await Event.find().sort({ date: 1 }).lean();

//         const eventsWithRealCount = await Promise.all(events.map(async (event) => {
//             const realCount = await Registration.countDocuments({
//                 event: event._id,
//                 status: { $in: ['VERIFIED', 'PENDING'] }
//             });
//             return { ...event, registeredCount: realCount };
//         }));

//         res.status(200).json({ success: true, count: eventsWithRealCount.length, data: eventsWithRealCount });
//     } catch (error) {
//         console.error("Error fetching events:", error);
//         res.status(500).json({ success: false, message: 'خطای سرور' });
//     }
// };

// export const getEventBySlug = async (req: AuthRequest, res: Response) => {
//     const { slug } = req.params;
//     const userId = req.user?._id;

//     try {
//         const event = await Event.findOne({ slug });
//         if (!event) return res.status(404).json({ success: false, message: 'رویداد یافت نشد.' });

//         let eventData: any = event.toObject();

//         const realCount = await Registration.countDocuments({
//             event: event._id,
//             status: { $in: ['VERIFIED', 'PENDING'] }
//         });
//         eventData.registeredCount = realCount;

//         if (userId) {
//             const userRegistration = await Registration.findOne({ event: event._id, user: userId })
//                 .select('status pricePaid trackingCode');

//             eventData.userRegistration = userRegistration ? userRegistration.toObject() : null;
//         } else {
//              eventData.userRegistration = null;
//         }

//         res.status(200).json({ success: true, data: eventData });

//     } catch (error: any) {
//         console.error("Error fetching event by slug:", error);
//         res.status(500).json({ success: false, message: 'خطای سرور' });
//     }
// };

// // ------------------------------------
// // ۳. ثبت‌نام در رویداد (Final Logic)
// // ------------------------------------
// export const registerForEvent = async (req: AuthRequest, res: Response) => {
//     const { id } = req.params;
//     const userId = req.user.id; // 🚨 FIX: استفاده از req.user.id

//     const { pricePaid, trackingCode, receiptImage } = req.body;

//     try {
//         const event = await Event.findById(id);
//         if (!event) return res.status(404).json({ success: false, message: 'رویداد پیدا نشد.' });

//         const registrationsCount = await Registration.countDocuments({ event: id, status: { $in: ['VERIFIED', 'PENDING'] } });
//         if (registrationsCount >= event.capacity) {
//             return res.status(400).json({ success: false, message: 'ظرفیت رویداد تکمیل شده است.' });
//         }

//         const existingReg = await Registration.findOne({
//             event: id,
//             user: userId,
//             status: { $in: ['VERIFIED', 'PENDING'] }
//         });

//         if (existingReg) {
//             return res.status(400).json({
//                 success: false,
//                 message: existingReg.status === 'VERIFIED'
//                     ? 'شما قبلاً ثبت‌نام تأیید شده در این رویداد دارید.'
//                     : 'درخواست ثبت‌نام شما در انتظار تأیید است.'
//             });
//         }

//         let priceToStore = pricePaid ?? event.price;
//         let newStatus = event.isFree ? 'VERIFIED' : 'PENDING';

//         const registration = await Registration.create({
//             user: userId,
//             event: id,
//             status: newStatus,
//             pricePaid: priceToStore,
//             trackingCode: trackingCode || null,
//             receiptImage: receiptImage || null,
//             registeredAt: new Date(),
//         });

//         if (newStatus === 'VERIFIED') {
//              await Event.findByIdAndUpdate(id, { $inc: { registeredCount: 1 } });
//         }

//         const message = event.isFree
//             ? 'ثبت‌نام با موفقیت انجام شد.'
//             : 'درخواست ثبت‌نام شما ثبت شد و منتظر تأیید پرداخت بمانید.';

//         return res.status(200).json({ success: true, message, registration });

//     } catch (error: any) {
//         console.error('Registration Error:', error);
//         return res.status(500).json({ success: false, message: 'خطای داخلی سرور هنگام ثبت‌نام.' });
//     }
// };

// // ------------------------------------
// // ۴. ایجاد رویداد جدید
// // ------------------------------------

// export const createEvent = async (req: AuthRequest, res: Response) => {
//     try {
//         const { title, slug, description, date, location, capacity, isFree, price, thumbnail } = req.body;

//         const event = await Event.create({
//             title,
//             slug,
//             description,
//             date,
//             location,
//             capacity,
//             isFree,
//             price,
//             thumbnail,
//             creator: req.user._id
//         });

//         return res.status(201).json({
//             success: true,
//             message: "رویداد با موفقیت ساخته شد.",
//             eventId: event._id
//         });

//     } catch (error: any) {
//         console.error("Error creating event:", error);
//         if (error.code === 11000) {
//             return res.status(400).json({ success: false, message: 'این آدرس (Slug) قبلا استفاده شده است.' });
//         }
//         return res.status(500).json({ success: false, message: 'خطای داخلی سرور هنگام ایجاد رویداد.' });
//     }
// };

// // ------------------------------------
// // ۵. دریافت رویداد با ID (برای ویرایش)
// // ------------------------------------

// export const getEventById = async (req: Request, res: Response) => {
//     try {
//         const event = await Event.findById(req.params.id);
//         if (!event) return res.status(404).json({ success: false, message: 'رویداد یافت نشد' });
//         res.status(200).json({ success: true, data: event });
//     } catch (error) {
//         res.status(500).json({ success: false, message: 'خطای سرور' });
//     }
// };

// // ------------------------------------
// // ۶. ویرایش رویداد (Admin)
// // ------------------------------------

// export const updateEvent = async (req: Request, res: Response) => {
//     try {
//         const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
//             new: true,
//             runValidators: true
//         });

//         if (!event) return res.status(404).json({ success: false, message: 'رویداد یافت نشد' });

//         res.status(200).json({ success: true, data: event, message: 'رویداد ویرایش شد' });
//     } catch (error) {
//         res.status(500).json({ success: false, message: 'خطای سرور' });
//     }
// };

// // ------------------------------------
// // ۷. دریافت ثبت‌نام‌های کاربر (داشبورد دانشجو)
// // ------------------------------------

// export const getMyRegistrations = async (req: AuthRequest, res: Response) => {
//     try {
//         const userId = req.user.id;

//         const registrations = await Registration.find({ user: userId })
//             .populate('event', 'title date location slug thumbnail')
//             .sort({ registeredAt: -1 });

//         res.status(200).json({ success: true, data: registrations });
//     } catch (error) {
//         console.error("Error in getMyRegistrations:", error);
//         res.status(500).json({ success: false, message: 'خطای سرور' });
//     }
// };

// // ------------------------------------
// // ۸. دریافت وضعیت ثبت نام (برای روت جداگانه)
// // ------------------------------------
// export const getRegistrationStatus = async (req: AuthRequest, res: Response) => {
//     const { slug } = req.params;
//     const userId = req.user?.id;

//     if (!userId) {
//          return res.status(200).json({ success: true, isRegistered: false, status: null });
//     }

//     try {
//         const event = await Event.findOne({ slug }).select('_id');
//         if (!event) {
//             return res.status(404).json({ success: false, message: 'رویداد پیدا نشد.' });
//         }

//         const registration = await Registration.findOne({
//             user: userId,
//             event: event._id,
//             status: { $in: ['PENDING', 'VERIFIED', 'FAILED'] }
//         })
//         .select('status pricePaid trackingCode');

//         if (!registration) {
//             return res.status(200).json({ success: true, isRegistered: false, status: null });
//         }

//         return res.status(200).json({
//             success: true,
//             isRegistered: true,
//             status: registration.status,
//             data: registration
//         });

//     } catch (error) {
//         console.error('Error fetching registration status:', error);
//         return res.status(500).json({ success: false, message: 'خطای داخلی سرور' });
//     }
// };

// // ------------------------------------
// // ۹. حذف رویداد (Delete Event)
// // ------------------------------------
// export const deleteEvent = async (req: AuthRequest, res: Response) => {
//     try {
//         const eventId = req.params.id;
//         const event = await Event.findById(eventId);
//         if (!event) {
//             return res.status(404).json({ success: false, message: 'رویداد یافت نشد.' });
//         }

//         await Registration.deleteMany({ event: eventId });
//         await Event.findByIdAndDelete(eventId);

//         res.json({ success: true, message: 'رویداد و تمام ثبت‌نام‌های آن با موفقیت حذف شدند.' });
//     } catch (error) {
//         console.error("Delete Event Error:", error);
//         res.status(500).json({ success: false, message: 'خطا در حذف رویداد.' });
//     }
// };

// // ------------------------------------
// // ۱۰. آپلود رسید (Upload Receipt)
// // ------------------------------------
// export const uploadReceipt = async (req: any, res: Response) => {
//     const { id: eventId } = req.params;
//     const userId = req.user.id;

//     if (!req.file) {
//         return res.status(400).json({ success: false, message: 'فایل رسید موجود نیست.' });
//     }

//     const receiptUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

//     try {
//         const registration = await Registration.findOneAndUpdate(
//             { user: userId, event: eventId },
//             {
//                 receiptImage: receiptUrl,
//                 status: 'RECEIPT_PENDING'
//             },
//             { new: true }
//         );

//         if (!registration) {
//             return res.status(404).json({ success: false, message: 'ثبت‌نام برای این رویداد یافت نشد.' });
//         }

//         res.json({
//             success: true,
//             message: 'رسید با موفقیت ارسال شد و در انتظار تأیید ادمین است.',
//             registration: registration
//         });

//     } catch (error: any) {
//         console.error('Error uploading receipt:', error);
//         res.status(500).json({ success: false, message: 'خطای سرور در آپلود رسید.' });
//     }
// };

import { Request, Response } from "express";
import Event from "../models/Event";
import Registration from "../models/Registration";
import User from "../models/User";
import { AuthRequest } from "../middlewares/auth.middleware";

export const getEvents = async (req: Request, res: Response) => {
  try {
    const events = await Event.find().sort({ date: 1 }).lean();

    const eventsWithRealCount = await Promise.all(
      events.map(async (event) => {
        const realCount = await Registration.countDocuments({
          event: event._id,
          status: { $in: ["VERIFIED", "PENDING"] },
        });
        return { ...event, registeredCount: realCount };
      })
    );

    res
      .status(200)
      .json({
        success: true,
        count: eventsWithRealCount.length,
        data: eventsWithRealCount,
      });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ success: false, message: "خطای سرور" });
  }
};

export const getEventBySlug = async (req: AuthRequest, res: Response) => {
 const { slug } = req.params;
 // ✅ اصلاح: استفاده از .id به جای ._id برای هماهنگی با سایر کنترلرها و جلوگیری از خطای Mongoose
 const userId = req.user?.id; 
 try {
  const event = await Event.findOne({ slug });
  if (!event)
   return res
    .status(404)
    .json({ success: false, message: "رویداد یافت نشد." });
  let eventData: any = event.toObject();
  const realCount = await Registration.countDocuments({
   event: event._id,
   status: { $in: ["VERIFIED", "PENDING"] },
  });
  eventData.registeredCount = realCount;
  if (userId) {
   const userRegistration = await Registration.findOne({
    event: event._id,
    user: userId,
   }).select("status pricePaid trackingCode receiptImage");
   eventData.userRegistration = userRegistration
    ? userRegistration.toObject()
    : null;
  } else {
   eventData.userRegistration = null;
  }
  res.status(200).json({ success: true, data: eventData });
 } catch (error: any) {
  console.error("Error fetching event by slug:", error);
  res.status(500).json({ success: false, message: "خطای سرور" });
 }
};
export const registerForEvent = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user.id;

  const { pricePaid, receiptImage, mobile, telegram } = req.body;

  try {
    const event = await Event.findById(id);
    if (!event)
      return res
        .status(404)
        .json({ success: false, message: "رویداد پیدا نشد." });

    const registrationsCount = await Registration.countDocuments({
      event: id,
      status: { $in: ["VERIFIED", "PENDING"] },
    });
    if (registrationsCount >= event.capacity) {
      return res
        .status(400)
        .json({ success: false, message: "ظرفیت تکمیل است." });
    }

    const existingReg = await Registration.findOne({
      event: id,
      user: userId,
      status: "VERIFIED",
    });

    if (existingReg) {
      return res
        .status(400)
        .json({ success: false, message: "قبلاً ثبت‌نام کرده‌اید." });
    }

    let priceToStore = pricePaid ?? event.price;
    let newStatus = event.isFree ? "VERIFIED" : "PENDING";

    const registration = await Registration.findOneAndUpdate(
      { user: userId, event: id },
      {
        status: newStatus,
        pricePaid: priceToStore,
        receiptImage: receiptImage || null,
        mobile: mobile || "",
        telegram: telegram || "",
        registeredAt: new Date(),
      },
      { new: true, upsert: true, runValidators: true }
    );

    if (newStatus === "VERIFIED") {
      await Event.findByIdAndUpdate(id, { $inc: { registeredCount: 1 } });
    }

    const message = event.isFree
      ? "ثبت‌نام موفق."
      : "اطلاعات ثبت شد. منتظر تأیید باشید.";

    return res.status(200).json({ success: true, message, registration });
  } catch (error: any) {
    console.error("Registration Error:", error);
    return res.status(500).json({ success: false, message: "خطای سرور." });
  }
};

export const createEvent = async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      slug,
      description,
      date,
      location,
      capacity,
      isFree,
      price,
      thumbnail,
      registrationStatus,
    } = req.body;

    const newEvent = await Event.create({
      title,
      slug,
      description,
      date: date ? new Date(date) : new Date(),
      location,
      capacity,
      isFree,
      price: price ?? 0,
      thumbnail: thumbnail ?? "",
      creator: req.user._id,
      registrationStatus: registrationStatus || "SCHEDULED",
      registrationOpensAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "رویداد با موفقیت ساخته شد.",
      eventId: newEvent._id,
    });
  } catch (error: any) {
    console.error("Create Event Error:", error);
    if (error.code === 11000) {
      return res
        .status(400)
        .json({
          success: false,
          message: "این آدرس (Slug) قبلاً استفاده شده است.",
        });
    }
    return res
      .status(500)
      .json({ success: false, message: "خطای داخلی سرور هنگام ایجاد رویداد." });
  }
};

export const getEventById = async (req: Request, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event)
      return res
        .status(404)
        .json({ success: false, message: "رویداد یافت نشد" });
    res.status(200).json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: "خطای سرور" });
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!event)
      return res
        .status(404)
        .json({ success: false, message: "رویداد یافت نشد" });
    res
      .status(200)
      .json({ success: true, data: event, message: "رویداد ویرایش شد" });
  } catch (error) {
    res.status(500).json({ success: false, message: "خطا در ویرایش" });
  }
};

export const getMyRegistrations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const registrations = await Registration.find({ user: userId })
      .populate("event", "title date location slug thumbnail")
      .sort({ registeredAt: -1 });

    res.status(200).json({ success: true, data: registrations });
  } catch (error) {
    console.error("Error in getMyRegistrations:", error);
    res.status(500).json({ success: false, message: "خطای سرور" });
  }
};

export const getRegistrationStatus = async (
  req: AuthRequest,
  res: Response
) => {
  const { slug } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    return res
      .status(200)
      .json({ success: true, isRegistered: false, status: null });
  }

  try {
    const event = await Event.findOne({ slug }).select("_id");
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "رویداد پیدا نشد." });
    }

    const registration = await Registration.findOne({
      user: userId,
      event: event._id,
      status: { $in: ["PENDING", "VERIFIED", "FAILED"] },
    }).select("status pricePaid trackingCode");

    if (!registration) {
      return res
        .status(200)
        .json({ success: true, isRegistered: false, status: null });
    }

    return res.status(200).json({
      success: true,
      isRegistered: true,
      status: registration.status,
      data: registration,
    });
  } catch (error) {
    console.error("Error fetching registration status:", error);
    return res.status(500).json({ success: false, message: "خطای داخلی سرور" });
  }
};

export const uploadReceipt = async (req: any, res: Response) => {
  const { id: eventId } = req.params;
  const userId = req.user.id;

  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "فایل رسید موجود نیست." });
  }

  const receiptUrl = `${req.protocol}://${req.get("host")}/uploads/${
    req.file.filename
  }`;

  try {
    const registration = await Registration.findOneAndUpdate(
      { user: userId, event: eventId },
      {
        receiptImage: receiptUrl,
        status: "RECEIPT_PENDING",
      },
      { new: true }
    );

    if (!registration) {
      return res
        .status(404)
        .json({ success: false, message: "ثبت‌نام برای این رویداد یافت نشد." });
    }

    res.json({
      success: true,
      message: "رسید با موفقیت ارسال شد و در انتظار تأیید ادمین است.",
      registration: registration,
    });
  } catch (error: any) {
    console.error("Error uploading receipt:", error);
    res
      .status(500)
      .json({ success: false, message: "خطای سرور در آپلود رسید." });
  }
};

export const deleteEvent = async (req: AuthRequest, res: Response) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "رویداد یافت نشد." });
    }

    await Registration.deleteMany({ event: eventId });
    await Event.findByIdAndDelete(eventId);

    res.json({
      success: true,
      message: "رویداد و تمام ثبت‌نام‌های آن با موفقیت حذف شدند.",
    });
  } catch (error) {
    console.error("Delete Event Error:", error);
    res.status(500).json({ success: false, message: "خطا در حذف رویداد." });
  }
};
