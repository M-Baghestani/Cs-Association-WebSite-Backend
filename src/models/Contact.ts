import mongoose, { Schema, Document } from 'mongoose';

// ساختار هر پیام داخل تیکت
const MessageSchema = new Schema({
  sender: { type: String, enum: ['USER', 'ADMIN'], required: true }, // چه کسی پیام داده؟
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export interface IContact extends Document {
  user?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  subject: string;
  status: 'OPEN' | 'CLOSED';
  messages: { sender: string; content: string; createdAt: Date }[];
  updatedAt: Date;
}

const ContactSchema: Schema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  
  status: { type: String, enum: ['OPEN', 'CLOSED'], default: 'OPEN' },
  
  messages: [MessageSchema]
  
}, { timestamps: true });

export default mongoose.model<IContact>('Contact', ContactSchema);