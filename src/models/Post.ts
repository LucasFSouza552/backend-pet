import { Document, Schema, model } from "mongoose";

export default interface IPost extends Document{
    title: string;
    content: string;
    image?: Buffer;
    date: Date;
    likes: number;
    author: Schema.Types.ObjectId;
    authorModel: "User" | "Institution" | "Admin";
}

const postSchema = new Schema<IPost>({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true,
    },
    image: {
        type: Buffer
    },
    date: {
        type: Date,
        default: Date.now,
    },
    likes: {
        type: Number,
        default: 0,
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    authorModel: {
        type: String,
        enum: ['User', 'Institution', 'Admin'],
        required: true
    }
});

export const Post = model<IPost>('Post', postSchema);