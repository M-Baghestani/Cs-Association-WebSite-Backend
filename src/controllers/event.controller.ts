import { Request, Response } from "express";
import mongoose from "mongoose";
import Event from "../models/Event";
import Registration from "../models/Registration";
import { AuthRequest } from "../middlewares/auth.middleware";

// ✅ تابع کمکی برای جلوگیری از کرش کردن سرور با آیدی‌های خراب
const isValidId = (id: string) => mongoose.Types.ObjectId.isValid(id);

// 1. دریافت لیست رویدادها
export const getEvents = async (req: Request, res: Response) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 }).lean();

    const eventsWithRealCount = await Promise.all(
      events.map(async (event) => {
        const realCount = await Registration.countDocuments({
          event: event._id,
          status: { $in: ["VERIFIED", "PENDING"] },
        });
        return { ...event, registeredCount: realCount };
      })
    );

    res.status(200).json({
      success: true,
      count: eventsWithRealCount.length,
      data: eventsWithRealCount,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ success: false, message: "خطای سرور" });
  }
};

// 2. دریافت رویداد با ID (جایگزین کامل GetBySlug)
export const getEventById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?._id || req.user?.id;

  try {
    // ✅ جلوگیری از ارور CastError
    if (!isValidId(id)) {
      return res.status(404).json({ success: false, message: "رویداد یافت نشد (شناسه نامعتبر)." });
    }

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ success: false, message: "رویداد یافت نشد." });

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
      }).select("status pricePaid trackingCode receiptImage telegram questions");
      
      eventData.userRegistration = userRegistration ? userRegistration.toObject() : null;
    } else {
      eventData.userRegistration = null;
    }

    res.status(200).json({ success: true, data: eventData });
  } catch (error: any) {
    console.error("Error fetching event by ID:", error);
    res.status(500).json({ success: false, message: "خطای سرور" });
  }
};

// 3. تابع ساختگی برای سازگاری با روت‌های قدیمی (اختیاری)
export const getEventBySlug = async (req: AuthRequest, res: Response) => {
    return res.status(404).json({ success: false, message: "استفاده از اسلاگ منسوخ شده است." });
};

// 4. ثبت‌نام در رویداد
export const registerForEvent = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?._id || req.user?.id; 

  const { pricePaid, receiptImage, mobile, telegram, questions, trackingCode } = req.body;

  if (!isValidId(id)) return res.status(404).json({ success: false, message: "رویداد پیدا نشد." });

  try {
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ success: false, message: "رویداد پیدا نشد." });

    const registrationsCount = await Registration.countDocuments({
      event: id,
      status: { $in: ["VERIFIED", "PENDING"] },
    });
    if (registrationsCount >= event.capacity) {
      return res.status(400).json({ success: false, message: "ظرفیت تکمیل است." });
    }

    const existingReg = await Registration.findOne({
      event: id,
      user: userId,
      status: "VERIFIED",
    });

    if (existingReg) {
      return res.status(400).json({ success: false, message: "قبلاً ثبت‌نام کرده‌اید." });
    }

    let priceToStore = pricePaid ?? event.price;
    let newStatus = event.isFree ? "VERIFIED" : "PENDING";

    const validQuestions = Array.isArray(questions)
      ? questions.filter((q: string) => q.trim().length > 0)
      : [];

    const registration = await Registration.findOneAndUpdate(
      { user: userId, event: id },
      {
        status: newStatus,
        pricePaid: priceToStore,
        receiptImage: receiptImage || null,
        mobile: mobile || "",
        telegram: telegram || "",
        questions: validQuestions,
        trackingCode: trackingCode || null,
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

// 5. ایجاد رویداد (بدون اسلاگ)
export const createEvent = async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      description, // فیلد slug حذف شد
      date,
      location,
      capacity,
      isFree,
      price,
      thumbnail,
      registrationStatus,
      hasQuestions
    } = req.body;

    const eventData = {
      title,
      description,
      date: date ? new Date(date) : new Date(),
      location,
      capacity,
      isFree,
      price: price ?? 0,
      thumbnail: thumbnail ?? "",
      creator: req.user?._id,
      registrationStatus: registrationStatus || "SCHEDULED",
      registrationOpensAt: new Date(),
      hasQuestions: hasQuestions || false,
    };

    const newEvent = await Event.create(eventData);

    return res.status(201).json({
      success: true,
      message: "رویداد با موفقیت ساخته شد.",
      eventId: newEvent._id,
    });
  } catch (error: any) {
    console.error("Create Event Error:", error);
    return res.status(500).json({ success: false, message: "خطای داخلی سرور." });
  }
};

// 6. ویرایش رویداد
export const updateEvent = async (req: Request, res: Response) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ success: false, message: "رویداد یافت نشد" });

    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!event) return res.status(404).json({ success: false, message: "رویداد یافت نشد" });
    res.status(200).json({ success: true, data: event, message: "رویداد ویرایش شد" });
  } catch (error) {
    res.status(500).json({ success: false, message: "خطا در ویرایش" });
  }
};

// 7. دریافت ثبت‌نام‌های من
export const getMyRegistrations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "کاربر نامعتبر" });

    const registrations = await Registration.find({ user: userId })
      .populate("event", "title date location thumbnail")
      .sort({ registeredAt: -1 });

    // فیلتر کردن رویدادهای حذف شده
    const validRegistrations = registrations.filter((reg) => reg.event != null);

    res.status(200).json({ success: true, data: validRegistrations });
  } catch (error) {
    console.error("Error in getMyRegistrations:", error);
    res.status(500).json({ success: false, message: "خطای سرور" });
  }
};

// 8. دریافت وضعیت ثبت نام (با ID)
export const getRegistrationStatus = async (req: AuthRequest, res: Response) => {
  // اینجا هم slug و هم id را چک میکنیم چون ممکن است روت قدیمی صدا زده شود
  const paramId = req.params.id || req.params.slug;
  const userId = req.user?._id || req.user?.id;

  if (!userId) {
    return res.status(200).json({ success: true, isRegistered: false, status: null });
  }

  if (!isValidId(paramId)) {
      // اگر آیدی معتبر نیست، یعنی رویدادی نیست، پس ثبت نامی هم نیست
      return res.status(200).json({ success: true, isRegistered: false, status: null });
  }

  try {
    const registration = await Registration.findOne({
      user: userId,
      event: paramId,
      status: { $in: ["PENDING", "VERIFIED", "FAILED"] },
    }).select("status pricePaid trackingCode");

    if (!registration) {
      return res.status(200).json({ success: true, isRegistered: false, status: null });
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

// 9. آپلود رسید
export const uploadReceipt = async (req: any, res: Response) => {
  const { id: eventId } = req.params;
  const userId = req.user?._id || req.user?.id;

  if (!req.file) {
    return res.status(400).json({ success: false, message: "فایل رسید موجود نیست." });
  }

  const receiptUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

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
      return res.status(404).json({ success: false, message: "ثبت‌نام یافت نشد." });
    }

    res.json({
      success: true,
      message: "رسید ارسال شد.",
      registration: registration,
    });
  } catch (error: any) {
    console.error("Error uploading receipt:", error);
    res.status(500).json({ success: false, message: "خطای سرور در آپلود." });
  }
};

// 10. حذف رویداد
export const deleteEvent = async (req: AuthRequest, res: Response) => {
  try {
    const eventId = req