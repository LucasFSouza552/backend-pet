import defaultTransform from "@utils/transformModel";
import { Document, Schema, Types, model } from "mongoose";

export default interface IPet extends Document {
  name: string;
  type: "Cachorro" | "Gato" | "Pássaro" | "Outro";
  age?: number;
  gender: "male" | "famale";
  weight: number;
  images?: Types.ObjectId[];
  description?: string;
  adopted: boolean;
  account: Schema.Types.ObjectId | string;
  adoptedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
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
      enum: ["male", "female"],
      required: true,
    },
    weight: {
      type: Number,
      required: true,
    },
    images: {
      type: [Schema.Types.ObjectId],
      required: false,
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
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    strict: true,
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

petSchema.virtual('id').get(function (this: Document & { _id: Types.ObjectId }) {
  return this._id.toString() as string;
});


export const Pet = model<IPet>("Pet", petSchema);
