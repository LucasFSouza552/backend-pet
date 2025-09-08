import { Document, Schema, model } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    address: {
        street: string;
        number: string;
        complement?: string;
        city: string;
        cep: string;
        state: string;
    };
}

const userSchema = new Schema<IUser>({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
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

export const User = model<IUser>("User", userSchema);