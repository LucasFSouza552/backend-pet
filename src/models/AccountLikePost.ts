import { Schema, model, Document, Types } from "mongoose";

export interface IAccountLikePost extends Document {
    accountId: Types.ObjectId;
    postId: Types.ObjectId;
    createdAt: Date;
}

const accountLikePostSchema = new Schema<IAccountLikePost>(
    {
        accountId: {
            type: Schema.Types.ObjectId,
            ref: "Account",
            required: true,
        },
        postId: {
            type: Schema.Types.ObjectId,
            ref: "Post",
            required: true
        },
    },
    { timestamps: true, strict: true }
);

accountLikePostSchema.index({ accountId: 1, postId: 1 }, { unique: true });

export const AccountLikePost = model<IAccountLikePost>(
    "AccountLikePost",
    accountLikePostSchema
);
