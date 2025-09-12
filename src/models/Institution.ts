import { Document, Schema, model } from "mongoose";

export interface IInstitution extends Document {
    name: string;
    cnpj: string;
    email: string;
    phone: string;
    address: {
        street: string;
        number: string;
        complement?: string;
        city: string;
        cep: string;
        state: string;
    };
}

const institutionSchema = new Schema<IInstitution>({
    name: {
        type: String,
        required: true,
    },
    cnpj: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
        required: true,
    },
    address: {
        street: {
            type: String,
            required: true,
        },
        number: {
            type: String,
            required: true,
        },
        complement: {
            type: String,
        },
        city: {
            type: String,
            required: true,
        },
        cep: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
            minlength: 2,
            maxlength: 2,
        },
    },
}, { timestamps: true });

export const Institution = model<IInstitution>("Institution", institutionSchema);
