// src/models/Member.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IMember extends Document {
 name: string;
 role: string; 
 image?: string;
 bio?: string; 
 linkedin?: string;
 github?: string;
 telegram?: string;
 website?: string;
 gender: 'male' | 'female' | 'other';
 year: string;
}

const MemberSchema: Schema = new Schema({
 name: { type: String, required: true },
 role: { type: String, required: true },
 image: { type: String, default: '' }, 
 bio: { type: String },
 linkedin: { type: String },
 github: { type: String },
  
  telegram: { type: String, trim: true, default: '' },
  website: { type: String, trim: true, default: '' },
  gender: { 
    type: String, 
    enum: ['male', 'female', 'other'],
    default: 'male',
    required: true,
  },
  
 year: { type: String, default: '1403' },
}, { timestamps: true });

export default mongoose.model<IMember>('Member', MemberSchema);