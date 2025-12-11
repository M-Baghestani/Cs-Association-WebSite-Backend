import mongoose, { Schema, Document } from 'mongoose';

export interface IRegistration extends Document {
  user: mongoose.Types.ObjectId;
  event: mongoose.Types.ObjectId;
  registeredAt: Date;
  status: 'PENDING' | 'VERIFIED' | 'FAILED' | 'PAID' | 'RECEIPT_PENDING';
  pricePaid: number;
  receiptImage?: string;
  trackingCode?: string;
  mobile?: string;
  telegram?: string;
  questions?: string[];
}

const RegistrationSchema: Schema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  registeredAt: { type: Date, default: Date.now },
  
  status: { 
    type: String, 
    enum: ['PENDING', 'VERIFIED', 'FAILED', 'PAID', 'RECEIPT_PENDING'], 
    default: 'PENDING' 
  },
  pricePaid: { type: Number, default: 0 },
  receiptImage: { type: String },
  trackingCode: { type: String },
  mobile: { type: String },
  telegram: { type: String },
  questions: [{ type: String }],

}, { timestamps: true });

RegistrationSchema.index({ event: 1, status: 1 });
RegistrationSchema.index({ user: 1, event: 1 }, { unique: true });

export default mongoose.model<IRegistration>('Registration', RegistrationSchema);