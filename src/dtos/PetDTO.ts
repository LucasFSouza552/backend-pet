import { Schema } from "mongoose";

export interface createPetDTO {
    name: string;
    type: string;
    image?: Buffer;
    description?: string;
    age?: number;
}

export interface updatePetDTO {
    name?: string;
    type?: string;
    description?: string;
    age?: number;
    adopted?: boolean;
}