import { IAccount } from "@models/account";
import { IAccountAchievement } from "@models/accountAchievement";
import { AchievementDTO } from "./achievementDTO";

export type UpdateAccountDTO = Partial<
    Omit<IAccount, "createdAt" | "email" | "updatedAt" | "password" | "cpf" | "cnpj" | "verified" | "avatar">
> & {
    address?: Partial<IAccount["address"]>;
};

export type CreateAccountDTO = Omit<IAccount, "createdAt" | "updatedAt" | "verified">;

export type AccountDTO = Omit<IAccount, "password"> & {postCount?: number};

export type ChangePasswordDTO = {
    currentPassword: string;
    newPassword: string;
};

export type UpdateAvatarDTO = Pick<IAccount, "avatar">;

export type IAccountPopulated = Omit<IAccount, "password"> & {postCount?: number, achievements?: AchievementDTO[]};