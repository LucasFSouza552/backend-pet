import { Document, Schema, model } from "mongoose";

export default interface IHistory extends Document {
    action: string;
    description: string;
    entity_type: string;
    entity_id: string;
    user_id: string;
    changes: Record<string, any>;
    date: Date;
}

const historySchema = new Schema<IHistory>({
    action: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    entity_type: {
        type: String,
        required: true,
    },
    entity_id: {
        type: String,
        required: true,
    },
    user_id: {
        type: String,
        required: true,
    },
    changes: {
        type: Schema.Types.Mixed,
        required: false,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

export const History = model<IHistory>('History', historySchema);