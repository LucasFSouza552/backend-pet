import { createAccountDTO, updateAccountDTO } from "../dtos/AccountDTO";
import { ThrowError } from "../errors/ThrowError";
import Filter from "../interfaces/Filter";
import IService from "../interfaces/IService";
import { IAccount } from "../models/Account";
import AccountRepository from "../repositories/Account.repository";
import { cryptPassword } from "../utils/aes-crypto";

const accountRepository = new AccountRepository();

export class AccountService implements IService<createAccountDTO, updateAccountDTO, IAccount> {
    async getAll(filter: Filter): Promise<IAccount[]> {
        try {
            return accountRepository.getAll(filter);
        } catch (error: any) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Não foi possível listar os usuários.");
        }
    }
    async getById(id: string): Promise<IAccount> {
        try {
            return await accountRepository.getById(id);
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Não foi possível listar o usuário.");
        }
    }
    async create(data: IAccount): Promise<createAccountDTO> {
        try {
            const account = await accountRepository.getByEmail(data.email);
            if (account) throw ThrowError.conflict("E-mail ja cadastrado.");

            data.password = await cryptPassword(data.password);

            return await accountRepository.create(data);
        } catch (error: any) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Não foi possível criar o usuário.");
        }
    }
    async update(id: string, data: updateAccountDTO): Promise<updateAccountDTO> {
        try {
            return await accountRepository.update(id, data);
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