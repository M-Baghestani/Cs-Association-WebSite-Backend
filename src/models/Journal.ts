import mongoose, { Schema, Document } from 'mongoose';

export interface IJournal extends Document {
  title: string;
  editionNumber: number; 
  coverImage: string;
  pdfUrl: string;
  publishedAt: Date;
}

const JournalSchema: Schema = new Schema({
  title: { type: String, required: true },
  editionNumber: { type: Number, required: true },
  coverImage: { type: String, required: true },
  pdfUrl: { type: String, required: true },
  publishedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model<IJournal>('Journal', JournalSchema);