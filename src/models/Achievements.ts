import { Schema, Document, model } from "mongoose";

export interface IAchievement extends Document {
    id: string;
    name: string;
    description: string;
    type: "donation" | "sponsorship" | "adoption";
    requirements: number;
    icon: string; // Armazena o caminho da imagem no frontend
    createdAt: Date;
    updatedAt: Date;
}

const AchievementSchema = new Schema<IAchievement>({
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ["donation", "sponsorship", "adoption"],
        required: true,
    },
    description: {
        type: String,
    },
    requirements: {
        type: Number,
    }
}, { timestamps: true, strict: true });


export default model<IAchievement>("Achievement", AchievementSchema);