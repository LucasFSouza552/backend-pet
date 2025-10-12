import { AccountPetInteraction } from "../models/AccountPetInteraction";

export type createPetInteractionDTO = Omit<AccountPetInteraction, "createdAt" | "updatedAt">;

export type updatePetInteractionDTO = Omit<AccountPetInteraction, "createdAt" | "updatedAt">;