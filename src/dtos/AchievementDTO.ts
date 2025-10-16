import { IAchievement } from "@models/Achievements";

export type CreateAchievementDTO = Omit<IAchievement, "createdAt" | "updatedAt">; 

export type UpdateAchievementDTO = Partial<Omit<IAchievement, "createdAt" | "updatedAt">>;

export type AchievementDTO = Omit<IAchievement, "createdAt" | "updatedAt">;