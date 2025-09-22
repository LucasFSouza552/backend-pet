import { AccountDTO, CreateAccountDTO, UpdateAccountDTO } from "../dtos/AccountDTO";
import { ThrowError } from "../errors/ThrowError";
import Filter from "../interfaces/Filter";
import IService from "../interfaces/IService";
import accountMapper from "../mappers/accountMapper";
import { IAccount } from "../models/Account";
import AccountRepository from "../repositories/Account.repository";
import { cryptPassword } from "../utils/aes-crypto";

const accountRepository = new AccountRepository();

export class AccountService implements IService<CreateAccountDTO, UpdateAccountDTO, AccountDTO> {
    async getAll(filter: Filter): Promise<AccountDTO[]> {
        try {
            const accounts = await accountRepository.getAll(filter);
            return accounts.map(accountMapper);
        } catch (error: any) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Não foi possível listar os usuários.");
        }
    }
    async getById(id: string): Promise<AccountDTO> {
        try {
            const account = await accountRepository.getById(id);
            if (!account) throw ThrowError.notFound("Usuário não encontrado.");

            return accountMapper(account);
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Não foi possível listar o usuário.");
        }
    }
    async create(data: CreateAccountDTO): Promise<AccountDTO> {
        try {
            const account = await accountRepository.getByEmail(data.email);
            if (account) throw ThrowError.conflict("E-mail já cadastrado.");

            if (data.cpf) {
                const accountByCpf = await accountRepository.getByCpf(data.cpf);
                if (accountByCpf) throw ThrowError.conflict("CPF já cadastrado.");
            }

            if (data.cnpj) {
                const accountByCnpj = await accountRepository.getByCnpj(data.cnpj);
                if (accountByCnpj) throw ThrowError.conflict("CNPJ já cadastrado.");
            }

            data.password = await cryptPassword(data.password);

            const newAccount = await accountRepository.create(data);

            return accountMapper(newAccount);
        } catch (error: any) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Não foi possível criar o usuário.");
        }
    }
    async update(id: string, data: UpdateAccountDTO): Promise<AccountDTO> {
        try {
            const account = await accountRepository.update(id, data);

            return accountMapper(account);
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Não foi possível atualizar o usuário.");
        }
    }
    async delete(id: string): Promise<void> {
        try {
            await accountRepository.delete(id);
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Não foi possível deletar o usuário.");
        }
    }

    async getByEmail(email: string): Promise<IAccount | null> {
        try {
            return await accountRepository.getByEmail(email);
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Não foi possível buscar o usuário.");
        }
    }

}