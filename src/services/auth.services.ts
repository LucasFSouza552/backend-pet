// DTOS
import { AccountDTO, ChangePasswordDTO, CreateAccountDTO } from "@dtos/accountDTO";

// Errors
import { ThrowError } from "@errors/ThrowError";

// Mappers
import accountMapper from "@Mappers/accountMapper";

// Models
import { IAccount } from "@models/account";

// Utils
import { cryptPassword, validatePassword } from "@utils/aes-crypto";
import { sendEmail } from "@utils/emailService";
import JWT from "@utils/JwtEncoder";

// Repositories
import {
    authRepository
} from "@repositories/index";
import forgotPasswordTemplate from "templetes/forgotPasswordTemplate";
import validateEmailTemplate from "templetes/validateEmailTemplate";

export default class AuthService {

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

    async resendVerification(accountId: string) {
        try {
            const account = await authRepository.getById(accountId);
            if (!account) throw ThrowError.notFound("Usuário não encontrado.");

            const token = JWT.encodeToken({ id: account.id });

            const html = validateEmailTemplate(account.name, token);
            await sendEmail({
                to: account.email,
                subject: "Confirmação de Email - MyPets",
                text: `Olá!\n\nObrigado por se cadastrar no MyPets.\nPor favor, confirme seu endereço de email clicando no link abaixo:\nhttp://localhost:3000/verify-email?token=${token}\n\nSe você não se cadastrou, ignore este email.`,
                html
            }).catch(err => {
                throw ThrowError.internal("Não foi possível enviar o email de confirmação.");
            });
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Não foi possível reenviar o email de confirmação.");
        }
    }

    async sendEmailVerification(email: string): Promise<void> {
        try {
            const token = JWT.encodeToken({ id: "FakeAccountId" });
            const html = validateEmailTemplate("FakeAccount", token);
            await sendEmail({
                to: email,
                subject: "Confirmação de Email - MyPets",
                text: `Olá!\n\nObrigado por se cadastrar no MyPets.\nPor favor, confirme seu endereço de email clicando no link abaixo:\nhttp://localhost:3000/verify-email?token=${token}\n\nSe você não se cadastrou, ignore este email.`,
                html
            }).catch(err => {
                throw ThrowError.internal("Não foi possível enviar o email de confirmação.");
            });
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Não foi possível enviar o email de confirmação.");
        }
    }

    async create(data: CreateAccountDTO): Promise<void> {
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

            const newAccount = await authRepository.create(data).catch(err => {
                throw ThrowError.internal(err.message);
            });

            const token = JWT.encodeToken({ id: newAccount._id });

            const html = validateEmailTemplate(newAccount.name, token);
            await sendEmail({
                to: newAccount.email,
                subject: "Confirmação de Email - MyPets",
                text: `Olá!\n\nObrigado por se cadastrar no MyPets.\nPor favor, confirme seu endereço de email clicando no link abaixo:\nhttp://localhost:3000/verify-email?token=${token}\n\nSe você não se cadastrou, ignore este email.`,
                html
            }).catch(err => {
                throw ThrowError.internal("Não foi possível enviar o email de confirmação.");
            });
        } catch (error: any) {
            if (error instanceof ThrowError) throw error;

            throw ThrowError.internal("Não foi possível criar o usuário.");
        }
    }

    async verifyEmail(token: string): Promise<boolean> {
        try {

            if (!token) throw ThrowError.notFound("Usuário não encontrado.");

            const decodedToken = JWT.isJwtTokenValid(token);
            if (!decodedToken) throw ThrowError.notFound("Sessão inválida.");
            const accountFound = await authRepository.getById(decodedToken?.data?.id);
            if (!accountFound) throw ThrowError.notFound("Usuário não encontrado.");

            accountFound.verified = true;

            const updatedAccount = await authRepository.updateVerificationToken(accountFound);
            if (!updatedAccount) throw ThrowError.notFound("Usuário não encontrado.");

            return true;
        } catch (error: any) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Nao foi possivel buscar o usuario.");
        }
    }

    async forgotPassword(email: string): Promise<void> {
        try {
            const account = await authRepository.getByEmail(email);
            if (!account) throw ThrowError.notFound("Usuário não encontrado.");

            const token = JWT.encodeToken({ id: account._id });

            const html = forgotPasswordTemplate(account.name, token);

            await sendEmail({
                to: email,
                subject: "Recuperação de Senha - MyPets",
                text: `Olá!\n\nRecebemos uma solicitação para redefinir sua senha.\nUse este link para criar uma nova senha: http://localhost:3000/reset-password?token=${token}\n\nSe você não solicitou, ignore este email.`,
                html
            }).catch(err => { throw ThrowError.internal("Não foi possivel enviar o email.") });


        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Não foi possível redefinir a senha.");
        }
    }

    async resetPassword(token: string, password: string) {
        try {
            const verifyToken = authRepository.getTokenVerification(token);
            if (!verifyToken) throw ThrowError.notFound("Sessão inválida.");

            const decodedToken = JWT.isJwtTokenValid(token);
            if (!decodedToken) throw ThrowError.notFound("Sessão inválida.");

            const accountId = decodedToken?.data?.id;
            if (!accountId) throw ThrowError.notFound("Sessão inválida.");

            const account = await authRepository.getById(accountId);
            if (!account) throw ThrowError.notFound("Usuário não encontrado.");

            account.password = await cryptPassword(password);

            await authRepository.changePassword(accountId, account.password);
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Não foi possível redefinir a senha.");
        }
    }
}

