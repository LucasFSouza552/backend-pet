import { Schema, model, Document, Types } from "mongoose";

export interface IAccountLikePost extends Document {
    account: Types.ObjectId;
    post: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const accountLikePostSchema = new Schema<IAccountLikePost>(
    {
        account: {
            type: Schema.Types.ObjectId,
            ref: "Account",
            required: true,
        },
        post: {
            type: Schema.Types.ObjectId,
            ref: "Post",
            required: true
        },
    },
    { timestamps: true, strict: true }
);

accountLikePostSchema.index({ accountId: 1, post: 1 }, { unique: true });

export const AccountLikePost = model<IAccountLikePost>(
    "AccountLikePost",
    accountLikePostSchema
);
