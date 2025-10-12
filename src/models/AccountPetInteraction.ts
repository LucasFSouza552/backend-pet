import { Document, Schema, model } from "mongoose";

export interface AccountPetInteraction extends Document {
    account: Schema.Types.ObjectId | string;
    pet: Schema.Types.ObjectId | string;
    status: "liked" | "disliked" | "viewed";
    createdAt: Date;
    updatedAt: Date;
}

const accountPetInteractionSchema = new Schema<AccountPetInteraction>({
    account: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    pet: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    status: {
        type: String,
        enum: ["liked", "disliked", "viewed"],
        required: true,
    },
}, { timestamps: true, strict: true });

export const AccountPetInteraction = model<AccountPetInteraction>("AccountPetInteraction", accountPetInteractionSchema);

