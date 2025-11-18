import { IAchievement } from "@models/achievements";

export type CreateAchievementDTO = Omit<IAchievement, "createdAt" | "updatedAt">; 

export type UpdateAchievementDTO = Partial<Omit<IAchievement, "createdAt" | "updatedAt">>;

export type AchievementDTO = Omit<IAchievement, "createdAt" | "updatedAt">;