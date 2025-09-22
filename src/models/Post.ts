import { Document, Schema, model } from "mongoose";

export default interface IPost extends Document {
    title: string;
    comments?: number;
    content: string;
    image?: Buffer[];
    date: Date;
    likes: number;
    author: Schema.Types.ObjectId;
    authorModel: "User" | "Institution" | "Admin";
    createdAt: Date;
    updatedAt: Date;
}

const postSchema = new Schema<IPost>({
    title: {
        type: String,
        required: true
    },
    comments: {
        type: Number,
        default: 0,
        required: false
    },
    content: {
        type: String,
        required: true,
    },
    image: {
        type: [Buffer],
        required: false
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
}, { timestamps: true, strict: true });

export const Post = model<IPost>('Post', postSchema);