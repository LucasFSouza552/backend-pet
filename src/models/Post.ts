import { Document, Schema, Types, model } from "mongoose";
import { ITypeAccounts } from "../types/ITypeAccounts";

export default interface IPost extends Document {
    title: string;
    comments?: number;
    content: string;
    image?: Buffer[];
    date: Date;
    likes: Types.ObjectId[];
    accountId: Schema.Types.ObjectId;
    authorModel: ITypeAccounts;
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
    likes: [
        {
            type: Schema.Types.ObjectId,
            ref: "Account",
        },
    ],
    accountId: {
        type: Schema.Types.ObjectId,
        ref: 'Account',
        required: true
    },
    authorModel: {
        type: String,
        enum: ['user', 'institution', 'admin'],
        required: true
    }
}, { timestamps: true, strict: true });

export const Post = model<IPost>('Post', postSchema);