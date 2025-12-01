// src/models/Comment.ts

import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
  post: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  content: string;
  isApproved: boolean;

  adminReplyContent: string; 
  adminRepliedAt?: Date;
  isNewReply: boolean;
}

const CommentSchema: Schema = new Schema({
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  isApproved: { type: Boolean, default: false },
  
  adminReplyContent: { type: String, default: '' },
  adminRepliedAt: { type: Date },
  isNewReply: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model<IComment>('Comment', CommentSchema);