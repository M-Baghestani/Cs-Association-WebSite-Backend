import mongoose, { Schema, Document } from 'mongoose';

export interface IRegistration extends Document {
  user: mongoose.Types.ObjectId;
  event: mongoose.Types.ObjectId;
  registeredAt: Date;
  
  // 👇 فیلدهای جدید برای پرداخت
  status: 'PENDING' | 'PAID' | 'FAILED' | 'VERIFIED';
  pricePaid: number;
  trackingCode?: string;
  receiptImage?: string; // لینک عکس رسید آپلود شده
}

const RegistrationSchema: Schema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  registeredAt: { type: Date, default: Date.now },
  
  // 👇 فیلدهای جدید
  status: { type: String, enum: ['PENDING', 'PAID', 'FAILED', 'VERIFIED'], default: 'PENDING' },
  pricePaid: { type: Number, default: 0 },
  trackingCode: { type: String },
  receiptImage: { type: String },
});

RegistrationSchema.index({ user: 1, event: 1 }, { unique: true });

export default mongoose.model<IRegistration>('Registration', RegistrationSchema);