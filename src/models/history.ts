import { Document, Schema, model } from "mongoose";
import { IHistoryStatus } from "@Itypes/IHistoryStatus";
import defaultTransform from "@utils/transformModel";

export default interface IHistory extends Document {
    type: "adoption" | "sponsorship" | "donation";
    status?: IHistoryStatus;
    pet?: Schema.Types.ObjectId | string | null;
    institution?: Schema.Types.ObjectId | string;
    account: Schema.Types.ObjectId | string;
    amount?: string;
    externalReference?: string | null;
    createdAt: Date;
    updatedAt: Date;
    urlPayment?: string | null;
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
        type: Schema.Types.ObjectId,
        ref: 'Account',
        required: false
    },
    account: {
        type: Schema.Types.ObjectId,
        ref: 'Account',
        required: true
    },
    externalReference: {
        type: String,
        required: false,
        default: null
    },
    amount: {
        type: String
    },
    urlPayment: {
        type: String,
        required: false,
        default: null
    }
}, {
    timestamps: true, strict: true,
    toJSON: {
        virtuals: true,
        transform: defaultTransform,
    },
    toObject: {
        virtuals: true,
        transform: defaultTransform,
    },
});



export const History = model<IHistory>('History', historySchema);