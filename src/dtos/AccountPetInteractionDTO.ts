import { AccountPetInteraction } from "@models/accountPetInteraction";

export type createPetInteractionDTO = Omit<AccountPetInteraction, "createdAt" | "updatedAt">;

export type updatePetInteractionDTO = Omit<AccountPetInteraction, "createdAt" | "updatedAt">;