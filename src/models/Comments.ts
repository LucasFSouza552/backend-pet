import { Document, model, Schema } from "mongoose";

export default interface IComment extends Document {
    postId: Schema.Types.ObjectId;
    parentId?: Schema.Types.ObjectId;
    content: string;
    accountId: Schema.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const commentSchema = new Schema<IComment>({
    postId: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    parentId: {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
        required: false,
        default: null
    },
    content: {
        type: String,
        required: true
    },
    accountId: {
        type: Schema.Types.ObjectId,
        ref: 'Account',
        required: true
    },
}, { timestamps: true, strict: true });

export const Comment = model<IComment>('Comment', commentSchema);