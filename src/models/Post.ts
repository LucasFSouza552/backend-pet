import { Document, Schema, model } from "mongoose";

export default interface IPost extends Document{
    content: string;
    image: string;
    date: Date;
    likes: number;
}

const postSchema = new Schema<IPost>({
    content: {
        type: String,
        required: true,
    },
    image: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now,
    },
    likes: {
        type: Number,
        default: 0,
    },
});

export const Post = model<IPost>('Post', postSchema);