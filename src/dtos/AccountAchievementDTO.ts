import { IAccountAchievement } from "@models/accountAchievement";

export type addAchievement = Omit<IAccountAchievement, "createdAt" | "updatedAt">;