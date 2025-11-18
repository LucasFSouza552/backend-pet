import { AccountDTO, CreateAccountDTO } from "@dtos/accountDTO";
import accountMapper from "@Mappers/accountMapper";
import { Account, IAccount } from "@models/account";

export default class AuthRepository {
    async updateVerificationToken(account: IAccount): Promise<IAccount | null> {
        return await Account.findOneAndUpdate({ _id: account._id }, { verified: account.verified });
    }
    async getByEmail(email: string): Promise<IAccount | null> {
        return await Account.findOne({ email });
    }

    async changePassword(accountId: string, password: string): Promise<void> {
        await Account.findByIdAndUpdate(accountId, { password });
    }

    async getById(id: string): Promise<IAccount | null> {
         return await Account.findById({ _id: id }).exec();
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

    async getTokenVerification(emailVerificationToken: string) {
        return await Account.findOne({ emailVerificationToken });
    }

} 