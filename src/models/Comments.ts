import { Document, model, Schema } from "mongoose";

export default interface IComment extends Document {
    post_id: Schema.Types.ObjectId;
    parent_id?: Schema.Types.ObjectId;
    content: string;
    author: Schema.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const commentSchema = new Schema<IComment>({
    post_id: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    parent_id: {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
        required: false,
        default: null
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: ['User', 'Institution', 'Admin'],
        required: true
    },
}, { timestamps: true, strict: true });

export const Comment = model<IComment>('Comment', commentSchema);