import { FilterQuery } from "mongoose";
import Filter from "../interfaces/Filter";
import IRepository from "../interfaces/IRepository";
import { IAccount, Account } from "../models/Account";
import { CreateAccountDTO, UpdateAccountDTO } from "../dtos/AccountDTO";
import { ObjectId } from "mongodb";

export default class AccountRepository implements IRepository<CreateAccountDTO, UpdateAccountDTO, IAccount> {
    async updateAvatar(userId: string, avatar: ObjectId): Promise<void> {
        await Account.findByIdAndUpdate(userId, { avatar }, { new: true });
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
        const account = await Account.findById({ _id: id }).lean({ virtuals: true }).exec();
        return { ...account, id: account?._id } as IAccount;
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

    

    async getByCpf(cpf: string) {
        return await Account.findOne({ cpf });
    }
    async getByCnpj(cnpj: string) {
        return await Account.findOne({ cnpj });
    }
};