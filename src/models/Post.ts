import { Document, Schema, Types, model } from "mongoose";

export default interface IPost extends Document {
    title: string;
    comments?: Types.ObjectId[];
    commentsCount?: number;
    content: string;
    image?: Buffer[];
    date: Date;
    likes: Types.ObjectId[];
    account: Types.ObjectId | string;
    createdAt: Date;
    updatedAt: Date;
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
    account: {
        type: Schema.Types.ObjectId,
        ref: 'Account',
        required: true
    }
}, { timestamps: true, strict: true });

postSchema.virtual("comments", {
    ref: "Comment",
    localField: "_id",
    foreignField: "postId",
    justOne: false
});

postSchema.virtual("commentsCount", {
    ref: "Comment",
    localField: "_id",
    foreignField: "postId",
    count: true
});

postSchema.set("toObject", { virtuals: true });
postSchema.set("toJSON", { virtuals: true });


export const Post = model<IPost>('Post', postSchema);