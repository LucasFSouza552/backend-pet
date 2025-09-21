import { Schema, model, Document } from "mongoose";

export interface IAccountAchievement extends Document {
    account_id: Schema.Types.ObjectId;
    achievement_id: Schema.Types.ObjectId;
    created_at: Date;
    updated_at: Date;
}

const userAchievementSchema = new Schema<IAccountAchievement>({
    account_id: {
        type: Schema.Types.ObjectId,
        ref: "Account",
        required: true
    },
    achievement_id: {
        type: Schema.Types.ObjectId,
        ref: "Achievement",
        required: true
    },
}, { timestamps: true, strict: true });

export const AccountAchievement = model<IAccountAchievement>("AccountAchievement", userAchievementSchema);
