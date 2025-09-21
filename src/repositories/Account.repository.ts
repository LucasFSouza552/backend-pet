import { FilterQuery } from "mongoose";
import Filter from "../interfaces/Filter";
import IRepository from "../interfaces/IRepository";
import { IAccount, Account } from "../models/Account";
import { ThrowError } from "../errors/ThrowError";
import { AccountDTO, CreateAccountDTO, UpdateAccountDTO } from "../dtos/AccountDTO";

export default class AccountRepository implements IRepository<CreateAccountDTO, UpdateAccountDTO, IAccount> {

    async getAll(filter: Filter): Promise<IAccount[]> {
        try {
            const { page, limit, orderBy, order, query } = filter;

            const accounts = await Account.find(query as FilterQuery<IAccount>)
                .sort({ [orderBy]: order })
                .skip((page - 1) * limit)
                .limit(limit);

            return accounts;

        } catch (error: any) {
            throw ThrowError.internal("Erro ao buscar usuários.");
        }
    }
    async getById(id: string): Promise<IAccount> {
        try {
            const account = await Account.findById(id);
            if (!account) {
                throw ThrowError.notFound("Usuário não encontrado.");
            }
            return account;
        } catch (error) {
            throw ThrowError.internal("Erro ao buscar usuário.");
        }
    }
    async create(data: CreateAccountDTO): Promise<IAccount> {
        try {
            const account = new Account(data);
            await account.save();
            return account;
        } catch (error: any) {
            if (error.name === "ValidationError") {
                throw ThrowError.badRequest("Dados inválidos: " + error.message);
            }
            console.error(error);
            if (error.code === 11000) {
                throw ThrowError.conflict("E-mail já está em uso.");
            }

            throw ThrowError.internal("Erro ao criar usuário.");
        }
    }
    async update(id: string, data: UpdateAccountDTO): Promise<IAccount> {
        try {
            const user = await Account.findById(id);
            if (!user) {
                throw ThrowError.notFound("Usuário não encontrado.");
            }
            const updatedAccount = await Account.findByIdAndUpdate(id, data, {
                new: true,
                runValidators: true
            });
            if (!updatedAccount) {
                throw ThrowError.internal("Erro ao atualizar usuário.");
            }
            return updatedAccount;
        } catch (error: any) {

            if (error.name === "CastError") {
                throw ThrowError.badRequest("ID inválido.");
            }

            if (error.name === "ValidationError") {
                throw ThrowError.badRequest("Dados inválidos: " + error.message);
            }

            if (error.code === 11000) {
                throw ThrowError.conflict("E-mail já está em uso.");
            }
            throw ThrowError.internal("Erro ao atualizar usuário.");
        }
    }
    async delete(id: string): Promise<void> {
        try {
            const account = await Account.findByIdAndDelete(id);
            if (!account) {
                throw ThrowError.notFound("Usuário não encontrado.");
            }
        } catch (error) {
            throw ThrowError.internal("Erro ao deletar usuário.");
        }
    }

    async getByEmail(email: string): Promise<IAccount | null> {
        try {
            return await Account.findOne({ email });
        } catch (error) {
            throw ThrowError.internal("Erro ao buscar usuário por e-mail.");
        }
    }

    async getByCpf(cpf: string) {
        try {
            return await Account.findOne({ cpf });
        } catch (error: any) {
            throw ThrowError.internal("Erro ao buscar usuário.");
        }
    }
    async getByCnpj(cnpj: string) {
        try {
            return await Account.findOne({ cnpj });
        } catch (error: any) {
            throw ThrowError.internal("Erro ao buscar usuário.");
        }
    }

};