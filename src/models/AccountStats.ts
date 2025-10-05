import { Schema, model, Document } from "mongoose";

export interface AccountStats extends Document {
    account: Schema.Types.ObjectId;
    adoptions: number;
    donations: number;
    sponsorships: number;
}

const AccountStatsSchema = new Schema<AccountStats>({
    account: {
        type: Schema.Types.ObjectId,
        ref: "Account",
        required: true,
        unique: true
    },
    adoptions: {
        type: Number,
        default: 0
    },
    donations: {
        type: Number,
        default: 0
    },
    sponsorships: {
        type: Number,
        default: 0
    },
}, { timestamps: true, strict: true });

export const AccountStats = model<AccountStats>("AccountStats", AccountStatsSchema);
