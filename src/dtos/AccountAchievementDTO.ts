import { IAccountAchievement } from "../models/AccountAchievement";

export type addAchieviment = Omit<IAccountAchievement, "createdAt" | "updatedAt">;