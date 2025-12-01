// src/models/Member.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IMember extends Document {
  name: string;
  role: string; 
  image?: string;
  bio?: string; 
  linkedin?: string;
  github?: string;
  year: string;
}

const MemberSchema: Schema = new Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  image: { type: String, default: '' }, 
  bio: { type: String },
  linkedin: { type: String },
  github: { type: String },
  year: { type: String, default: '1403' },
}, { timestamps: true });

export default mongoose.model<IMember>('Member', MemberSchema);