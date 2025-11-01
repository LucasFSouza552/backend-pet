import { Document, model, Schema } from "mongoose";

export default interface IComment extends Document {
    post: Schema.Types.ObjectId;
    parent?: Schema.Types.ObjectId | string;
    content: string;
    account: Schema.Types.ObjectId | string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}

const commentSchema = new Schema<IComment>({
    post: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    parent: {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
        required: false,
        default: null
    },
    content: {
        type: String,
        required: true
    },
    account: {
        type: Schema.Types.ObjectId,
        ref: 'Account',
        required: true
    },
    deletedAt: {
        type: Date
    }
}, { timestamps: true, strict: true });

export const Comment = model<IComment>('Comment', commentSchema);