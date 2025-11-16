import IPet from "@models/pet";

export type CreatePetDTO = Omit<IPet, "createdAt" | "updatedAt" | "adoptedAt" | "adopted">;

export type UpdatePetDTO = Partial<Omit<IPet, "createdAt" | "updatedAt" | "adoptedAt">>;

export type PetDTO = Omit<IPet, "updatedAt">;