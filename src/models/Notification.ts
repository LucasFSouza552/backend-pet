import { Document, model, Schema, Types } from "mongoose";

export default interface INotification extends Document {
    sender: Types.ObjectId | string;
    type: "warning" | "info" | "like";
    content: string;
    image: Types.ObjectId;
    latitude: number;
    longitude: number;
    createdAt: Date;
    viewedAt: Date;
}

const notificationSchema = new Schema<INotification>({
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'Account',
        required: true
    },
    type: {
        type: String,
        enum: ['warning', 'info', 'like'],
        default: 'info'
    },
    content: {
        type: String,
        required: true
    },
    image: {
        type: Schema.Types.ObjectId,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    latitude: {
        type: Number,
        required: true
    },
    viewedAt: {
        type: Date
    }
}, { timestamps: true, strict: true });

export const Notification = model<INotification>('Notification', notificationSchema);