import { IAccountAchievement } from "@models/AccountAchievement";

export type addAchievement = Omit<IAccountAchievement, "createdAt" | "updatedAt">;