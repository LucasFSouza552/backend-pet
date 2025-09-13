import { Document, Schema, model } from "mongoose";
import IAddress from "../interfaces/IAddress";

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: "user" | "admin";
    verified: boolean;
    address: IAddress;
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
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Email inválido"]
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    verified: {
        type: Boolean,
        default: false,
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

}, { timestamps: true, strict: true });

export const User = model<IUser>("User", userSchema);