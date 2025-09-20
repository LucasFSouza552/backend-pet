import { Document, Schema, model } from "mongoose";

export default interface IPet extends Document {
    name: string;
    type: string;
    age?: number;
    image?: Buffer;
    description: string;
    adopted: boolean;
    owner_id?: Schema.Types.ObjectId;  
    adopted_at?: Date;
    created_at: Date;
    updated_at: Date;
}

const petSchema = new Schema<IPet>(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    age: {
      type: Number,
    },
    adopted: {
      type: Boolean,
      default: false,
    },
    owner_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      require: true
    },
    adopted_at: {
      type: Date,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

export const Pet = model<IPet>('Pet', petSchema)