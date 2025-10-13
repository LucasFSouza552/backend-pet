import { Document, ObjectId, Schema, Types, model } from "mongoose";

export default interface IPet extends Document {
  name: string;
  type: "Cachorro" | "Gato" | "Pássaro" | "Outro";
  age?: number;
  gender: "M" | "F";
  weight: number;
  images: Types.ObjectId[];
  description?: string;
  adopted: boolean;
  account: Schema.Types.ObjectId | string;
  adoptedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const petSchema = new Schema<IPet>(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["Cachorro", "Gato", "Pássaro", "Outro"],
      default: "Cachorro",
      required: true,
    },
    description: {
      type: String,
    },
    age: {
      type: Number,
    },
    gender: {
      type: String,
      enum: ["M", "F"],
      required: true,
    },
    weight: {
      type: Number,
      required: true,
    },
    images: {
      type: [Schema.Types.ObjectId], 
      required: true,
    },
    adopted: {
      type: Boolean,
      default: false,
    },
    account: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    adoptedAt: {
      type: Date,
    },
  },
  {
    timestamps: true, 
    strict: true,     
  }
);

export const Pet = model<IPet>("Pet", petSchema);
