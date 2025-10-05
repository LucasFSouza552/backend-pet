import { Schema, model, Document } from "mongoose";

export interface IAccountAchievement extends Document {
    account: Schema.Types.ObjectId;
    achievement: Schema.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const userAchievementSchema = new Schema<IAccountAchievement>({
    account: {
        type: Schema.Types.ObjectId,
        ref: "Account",
        required: true
    },
    achievement: {
        type: Schema.Types.ObjectId,
        ref: "Achievement",
        required: true
    },
}, { timestamps: true, strict: true });

export const AccountAchievement = model<IAccountAchievement>("AccountAchievement", userAchievementSchema);
