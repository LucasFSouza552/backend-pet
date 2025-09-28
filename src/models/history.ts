import { Document, Schema, model } from "mongoose";
import { IHistoryStatus } from "../types/IHistoryStatus";

export default interface IHistory extends Document {
    id: string;
    type: "adoption" | "sponsorship" | "donation";
    status: IHistoryStatus;
    petId: Schema.Types.ObjectId;
    accountId: Schema.Types.ObjectId;
    amount?: number;
    createdAt: Date;
    updatedAt: Date;
}

const historySchema = new Schema<IHistory>({
    type: {
        type: String,
        enum: ["adoption", "sponsorship", "donation"],
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "completed", "cancelled", "refunded"],
        required: true,
        default: "pending"
    },
    petId: {
        type: Schema.Types.ObjectId,
        ref: 'Pet'
    },
    accountId: {
        type: Schema.Types.ObjectId,
        ref: 'Account',
        required: true
    },
    amount: {
        type: Number
    }
}, { timestamps: true, strict: true });

export const History = model<IHistory>('History', historySchema);