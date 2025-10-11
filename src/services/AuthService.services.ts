import { AccountDTO, ChangePasswordDTO, CreateAccountDTO } from "../dtos/AccountDTO";
import { ThrowError } from "../errors/ThrowError";
import accountMapper from "../Mappers/accountMapper";
import { IAccount } from "../models/Account";
import AuthRepository from "../repositories/Auth.repository";
import { cryptPassword, validatePassword } from "../utils/aes-crypto";

const authRepository = new AuthRepository();
export class AuthService {
    async getByEmail(email: string): Promise<IAccount | null> {
        try {
            return await authRepository.getByEmail(email);
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Não foi possível buscar o usuário.");
        }
    }

    async changePassword(accountId: string, data: ChangePasswordDTO): Promise<void> {
        try {
            const account = await authRepository.getById(accountId);
            if (!account) {
                throw ThrowError.notFound("Usuário não encontrado.");
            }

            const passwordEncoded = await validatePassword(data.currentPassword, account.password);
            if (!passwordEncoded) {
                throw ThrowError.unauthorized("As senhas não concidem.");
            }

            account.password = await cryptPassword(data.newPassword);

            await authRepository.changePassword(accountId, account.password);

        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Não foi possível atualizar a senha.");
        }
    }

    async create(data: CreateAccountDTO): Promise<AccountDTO> {
        try {
            const account = await authRepository.getByEmail(data.email);
            if (account) throw ThrowError.conflict("E-mail já cadastrado.");

            if (data.cpf) {
                const accountByCpf = await authRepository.getByCpf(data.cpf);
                if (accountByCpf) throw ThrowError.conflict("CPF já cadastrado.");
            }

            if (data.cnpj) {
                const accountByCnpj = await authRepository.getByCnpj(data.cnpj);
                if (accountByCnpj) throw ThrowError.conflict("CNPJ já cadastrado.");
            }

            data.password = await cryptPassword(data.password);

            const newAccount = await authRepository.create(data);

            return accountMapper(newAccount);
        } catch (error: any) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Não foi possível criar o usuário.");
        }
    }
}

