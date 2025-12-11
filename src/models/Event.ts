import mongoose, {Schema, Document} from 'mongoose'

export interface IEvent extends Document{
    title: string;
    description:string;
    date:Date;
    location:string;
    capacity:number;
    registeredCount: number;
    isFree:boolean;
    price?:number;
    thumbnail?:string;
    creator:mongoose.Types.ObjectId;
    registrationStatus: 'SCHEDULED' | 'OPEN' | 'CLOSED';
    registrationOpensAt: Date; 
    hasQuestions: boolean;
}

const EventSchema: Schema = new Schema({
  title: { type: String, required: true },
  // slug حذف شد
  description: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  capacity: { type: Number, required: true },
  registeredCount: { type: Number, default:0 },
  isFree: { type: Boolean, default: true },
  price: { type: Number, default: 0 },
  thumbnail: { type: String , default: ''},
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  registrationStatus: { 
    type: String, 
    enum: ['SCHEDULED', 'OPEN', 'CLOSED'], 
    required: true 
  },
  registrationOpensAt: { type: Date, default: Date.now },
  hasQuestions: { type: Boolean, default: false },
}, {
  timestamps: true
});

EventSchema.index({ date: -1 });

export default mongoose.model<IEvent>('Event', EventSchema)