import mongoose, {Schema,Document} from 'mongoose';

export interface IGallery extends Document {
    title: string;
    description?:string;
    coverImage: string;
    images:string[];
    createdAt:Date;
}

const GallerySchema:Schema = new Schema({
    title: {type:String,required:true},
    description:{type:String},
    coverImage:{type:String, required:true},
    images:[{type:String}]
},{
    timestamps:true
})

export default mongoose.model<IGallery>('Gallery', GallerySchema)