import { Request, Response } from "express";
import mongoose from "mongoose";
import Event from "../models/Event";
import Registration from "../models/Registration";
import { AuthRequest } from "../middlewares/auth.middleware";

// 1. دریافت لیست رویدادها
export const getEvents = async (req: Request, res: Response) => {
  try {
    const events = await Event.aggregate([
      {
        $lookup: {
          from: "registrations",
          localField: "_id",
          foreignField: "event",
          as: "regs"
        }
      },
      {
        $addFields: {
          registeredCount: {
            $size: {
              $filter: {
                input: "$regs",
                as: "r",
                cond: { $in: ["$$r.status", ["VERIFIED", "PENDING"]] }
              }
            }
          }
        }
      },
      { $project: { regs: 0, __v: 0 } },
      { $sort: { createdAt: -1 } }
    ]);

    res.status(200).json({ success: true, count: events.length, data: events });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ success: false, message: "خطای سرور" });
  }
};

// 2. دریافت رویداد با ID
export const getEventById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?._id;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: "رویداد یافت نشد." });
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

// 3. ثبت‌نام در رویداد
export const registerForEvent = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  if (!req.user) return res.status(401).json({ success: false, message: "ابتدا وارد شوید." });
  const userId = req.user._id; 

  const { pricePaid, receiptImage, mobile, telegram, questions, trackingCode } = req.body;

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

// 4. ایجاد رویداد (اصلاح شده برای رفع خطای بیلد) 🛠️
export const createEvent = async (req: AuthRequest, res: Response) => {
  try {
    const {
      title, description, date, location, capacity, isFree, price, thumbnail, registrationStatus, hasQuestions
    } = req.body;

    const eventData: any = {
      title,
      description,
      date: date ? new Date(date) : new Date(),
      location,
      capacity,
      isFree,
      price: price ?? 0,
      thumbnail: thumbnail ?? "",
      creator: req.user ? req.user._id : null,
      registrationStatus: registrationStatus || "SCHEDULED",
      registrationOpensAt: new Date(),
      hasQuestions: hasQuestions || false,
    };

    // ✅ تغییر مهم: استفاده از as any برای جلوگیری از خطای TS2339
    const newEvent = (await Event.create(eventData)) as any;

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

// 5. ویرایش رویداد
export const updateEvent = async (req: Request, res: Response) => {
  try {
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

// 6. دریافت ثبت‌نام‌های من
export const getMyRegistrations = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "کاربر شناسایی نشد." });
    }
    
    const userId = req.user._id;
    
    const registrations = await Registration.find({ user: userId })
      .populate("event", "title date location thumbnail")
      .sort({ registeredAt: -1 });

    const validRegistrations = registrations.filter((reg) => reg.event != null);

    res.status(200).json({ success: true, data: validRegistrations });
  } catch (error) {
    console.error("Error in getMyRegistrations:", error);
    res.status(500).json({ success: false, message: "خطای سرور" });
  }
};

// 7. دریافت وضعیت ثبت نام (با ID)
export const getRegistrationStatus = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?._id;

  if (!userId) {
    return res.status(200).json({ success: true, isRegistered: false, status: null });
  }

  try {
    const registration = await Registration.findOne({
      user: userId,
      event: id,
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

// 8. آپلود رسید
export const uploadReceipt = async (req: any, res: Response) => {
  const { id: eventId } = req.params;
  
  if (!req.user) return res.status(401).json({ success: false, message: "غیرمجاز" });
  const userId = req.user._id;

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

// 9. حذف رویداد
export const deleteEvent = async (req: AuthRequest, res: Response) => {
  try {
    const eventId = req.params.id;
    await Registration.deleteMany({ event: eventId });
    await Event.findByIdAndDelete(eventId);
    res.json({ success: true, message: "رویداد حذف شد." });
  } catch (error) {
    console.error("Delete Event Error:", error);
    res.status(500).json({ success: false, message: "خطا در حذف رویداد." });
  }
};