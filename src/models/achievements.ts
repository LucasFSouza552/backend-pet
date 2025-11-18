import { Schema, Document, model } from "mongoose";

export interface IAchievement extends Document {
    name: string;
    description: string;
    type: "donation" | "sponsorship" | "adoption";
    createdAt: Date;
    updatedAt: Date;
}

const AchievementSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        enum: ["donation", "sponsorship", "adoption"] as const,
        required: true,
    },
    description: {
        type: String,
    }
}, { timestamps: true, strict: true });


export const Achievements = model<IAchievement>("Achievement", AchievementSchema);