import { IAccount } from "../models/Account";

export type UpdateAccountDTO = Partial<
    Omit<IAccount, "createdAt" | "email" | "updatedAt" | "password" | "cpf" | "cnpj" | "verified">
> & {
    password?: string;
    address?: Partial<IAccount["address"]>;
};

export type CreateAccountDTO = Omit<IAccount, "createdAt" | "updatedAt" | "verified">;

export type AccountDTO = Omit<IAccount, "password">;

export type ChangePasswordDTO = {
    currentPassword: string;
    newPassword: string;
};
