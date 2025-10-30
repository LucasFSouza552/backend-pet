import { Document, Schema, Types, model } from "mongoose";

export default interface IPost extends Document {
    title: string;
    comments?: Types.ObjectId[];
    commentsCount?: number;
    content: string;
    image?: Types.ObjectId[];
    likes: Types.ObjectId[];
    account: Types.ObjectId | string;
    updatedAt: Date;
    createdAt: Date;
    deletedAt?: Date;
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
        type: [Schema.Types.ObjectId],
        required: false
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
    },
    deletedAt: {
        type: Date
    }
}, { timestamps: true, strict: true });

postSchema.virtual("comments", {
    ref: "Comment",
    localField: "_id",
    foreignField: "post",
    justOne: false
});

postSchema.virtual("commentsCount", {
    ref: "Comment",
    localField: "_id",
    foreignField: "post",
    count: true
});

postSchema.virtual("id").get(function (this: Document & { _id: Types.ObjectId }) {
    return this._id.toString();
});

postSchema.set("toJSON", {
    virtuals: true,
    transform: (_, ret) => {
        delete ret._id;
    }
});

postSchema.set("toObject", { virtuals: true });
postSchema.set("toJSON", { virtuals: true });


export const Post = model<IPost>('Post', postSchema);