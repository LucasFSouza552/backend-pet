import { Document, Schema, model } from "mongoose";
import IAddress from "../interfaces/IAddress";

export interface IAccount extends Document {
    name: string;
    email: string;
    avatar: Buffer;
    password: string;
    phone_number: string;
    role: "user" | "admin" | "institution";
    cpf: string;
    cnpj: string;
    verified: boolean;
    address: IAddress;
    createdAt: Date;
    updatedAt: Date;
}

const accountSchema = new Schema<IAccount>(
    {
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
            match: [/^\S+@\S+\.\S+$/, "Email inválido"],
        },
        avatar: {
            type: Buffer,
            required: false,
            default: null,
        },
        password: {
            type: String,
            required: true,
        },
        phone_number: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ["user", "admin", "institution"],
            default: "user",
        },
        cpf: {
            type: String,
            required: function () {
                return this.role === "user" || this.role === "admin";
            },
            unique: true,
            sparse: true,
            match: [/^\d{11}$/, "CPF deve conter exatamente 11 dígitos numéricos"],
        },
        cnpj: {
            type: String,
            required: function () {
                return this.role === "institution";
            },
            unique: true,
            sparse: true,
            match: [/^\d{14}$/, "CNPJ deve conter exatamente 14 dígitos numéricos"],
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
    },
    { timestamps: true, strict: true }
);

export const Account = model<IAccount>("Account", accountSchema);