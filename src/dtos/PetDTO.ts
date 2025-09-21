import IPet from "../models/Pet";

export type CreatePetDTO = Omit<IPet, "createdAt" | "updatedAt" | "adoptedAt" | "adopted">

export type UpdatePetDTO = Omit<IPet, "createdAt" | "updatedAt" | "adoptedAt">