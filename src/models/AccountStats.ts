import { Schema, model, Document } from "mongoose";

export interface AccountStats extends Document {
    account_id: Schema.Types.ObjectId;
    adoptions: number;
    donations: number;
    sponsorships: number;
}

const AccountStatsSchema = new Schema<AccountStats>({
    account_id: { type: Schema.Types.ObjectId, ref: "Account", required: true, unique: true },
    adoptions: { type: Number, default: 0 },
    donations: { type: Number, default: 0 },
    sponsorships: { type: Number, default: 0 },
}, { timestamps: true });

export const UserStats = model<AccountStats>("AccountStats", AccountStatsSchema);
