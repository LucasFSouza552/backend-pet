import { Document, Schema, Types, model } from "mongoose";
import IAddress from "@interfaces/IAddress";
import { ITypeAccounts } from "@Itypes/ITypeAccounts";
import defaultTransform from "@utils/transformModel";

export interface IAccount extends Document {
    name: string;
    email: string;
    avatar?: Types.ObjectId;
    password: string;
    phone_number: string;
    role: ITypeAccounts;
    cpf?: string;
    cnpj?: string;
    verified: boolean;
    address?: IAddress;
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
            type: Schema.Types.ObjectId,
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
            required: function (this: IAccount) {
                return this.role === "user" || this.role === "admin";
            },
            unique: true,
            sparse: true,
            match: [/^\d{11}$/, "CPF deve conter exatamente 11 dígitos numéricos"],
        },
        cnpj: {
            type: String,
            required: function (this: IAccount) {
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
                required: false,
            },
            number: {
                type: String,
                required: false,
            },
            complement: {
                type: String,
            },
            city: {
                type: String,
                required: false,
            },
            cep: {
                type: String,
                required: false,
            },
            state: {
                type: String,
                required: false,
                minlength: 2,
                maxlength: 2,
            },
            neighborhood: {
                type: String,
                required: false,
            },
        }
    },
    {
        timestamps: true, strict: true,
        toJSON: {
            virtuals: true,
            transform: defaultTransform,
        },
        toObject: {
            virtuals: true,
            transform: defaultTransform,
        },
    }
);


accountSchema.virtual("achievements", {
    ref: "AccountAchievement",
    localField: "_id",
    foreignField: "account"
});

accountSchema.virtual("postCount", {
    ref: "Post",          
    localField: "_id",    
    foreignField: "account", 
    count: true
});



export const Account = model<IAccount>("Account", accountSchema);