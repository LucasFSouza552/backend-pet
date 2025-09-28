import { FilterQuery } from "mongoose";
import Filter from "../interfaces/Filter";
import IRepository from "../interfaces/IRepository";
import { IAccount, Account } from "../models/Account";
import { CreateAccountDTO, UpdateAccountDTO } from "../dtos/AccountDTO";

export default class AccountRepository implements IRepository<CreateAccountDTO, UpdateAccountDTO, IAccount> {
    async updateAvatar(userId: string, avatar: Buffer): Promise<void> {
        await Account.findByIdAndUpdate(userId, { avatar }, { new: true });
    }
    async changePassword(accountId: string, password: string): Promise<void> {
        await Account.findByIdAndUpdate(accountId, { password });
    }

    async getAll(filter: Filter): Promise<IAccount[]> {
        const { page, limit, orderBy, order, query } = filter;

        const accounts = await Account.find(query as FilterQuery<IAccount>)
            .sort({ [orderBy]: order })
            .skip((page - 1) * limit)
            .limit(limit);

        return accounts;
    }
    async getById(id: string): Promise<IAccount | null> {
        return await Account.findById(id);
    }
    async create(data: CreateAccountDTO): Promise<IAccount> {
        const account = new Account(data);
        await account.save();
        return account;
    }
    async update(id: string, data: UpdateAccountDTO): Promise<IAccount | null> {
        const updatedAccount = await Account.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true
        });
        return updatedAccount;
    }
    async delete(id: string): Promise<void> {
        await Account.findByIdAndDelete(id);
    }

    async getByEmail(email: string): Promise<IAccount | null> {
        return await Account.findOne({ email });
    }

    async getByCpf(cpf: string) {
        return await Account.findOne({ cpf });
    }
    async getByCnpj(cnpj: string) {
        return await Account.findOne({ cnpj });
    }
};