import { Document, Schema, model } from "mongoose";
import { IHistoryStatus } from "../types/IHistoryStatus";

export default interface IHistory extends Document {
    type: "adoption" | "sponsorship" | "donation";
    status?: IHistoryStatus;
    pet?: Schema.Types.ObjectId | string | null;
    institution?: string;
    account: Schema.Types.ObjectId | string;
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
    pet: {
        type: Schema.Types.ObjectId,
        ref: 'Pet'
    },
    institution: {
        type: String,
        required: false
    },
    account: {
        type: Schema.Types.ObjectId,
        ref: 'Account',
        required: true
    },
    amount: {
        type: Number
    }
}, { timestamps: true, strict: true });

export const History = model<IHistory>('History', historySchema);