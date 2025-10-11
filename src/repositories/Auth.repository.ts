import { CreateAccountDTO } from "../dtos/AccountDTO";
import { Account, IAccount } from "../models/Account";

export default class AuthRepository {
    async getByEmail(email: string): Promise<IAccount | null> {
        return await Account.findOne({ email });
    }

    async changePassword(accountId: string, password: string): Promise<void> {
        await Account.findByIdAndUpdate(accountId, { password });
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
    async getByCpf(cpf: string) {
        return await Account.findOne({ cpf });
    }
    async getByCnpj(cnpj: string) {
        return await Account.findOne({ cnpj });
    }

} 