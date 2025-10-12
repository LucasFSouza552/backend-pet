import { AccountDTO, AccountTokenDTO, ChangePasswordDTO, CreateAccountDTO } from "../dtos/AccountDTO";
import { ThrowError } from "../errors/ThrowError";
import accountMapper from "../Mappers/accountMapper";
import { Account, IAccount } from "../models/Account";
import AuthRepository from "../repositories/Auth.repository";
import { cryptPassword, validatePassword } from "../utils/aes-crypto";
import { sendEmail } from "../utils/emailService";
import JWT from "../utils/JwtEncoder";

const authRepository = new AuthRepository();
export class AuthService {
    async resetPassword(token: string, password: string) {
        try {
            const verifyToken = authRepository.getTokenVerification(token);
            if (!verifyToken) throw ThrowError.notFound("Token inválido.");

            const decodedToken = JWT.isJwtTokenValid(token);
            if (!decodedToken) throw ThrowError.notFound("Token inválido.");

            const accountId = decodedToken?.data?.id;
            if (!accountId) throw ThrowError.notFound("Token inválido.");

            const account = await authRepository.getById(accountId);
            if (!account) throw ThrowError.notFound("Usuário não encontrado.");

            account.password = await cryptPassword(password);

            await authRepository.changePassword(accountId, account.password);
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Não foi possível redefinir a senha.");
        }
    }
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

    async verifyEmail(account: AccountTokenDTO): Promise<AccountDTO> {
        try {

            if (!account || !account?.emailVerificationToken) throw ThrowError.notFound("Usuário não encontrado.");

            const accountFound = await authRepository.getTokenVerification(account.emailVerificationToken);
            if (!accountFound) throw new Error("Token inválido ou expirado");
            if (!accountFound.verified) throw ThrowError.notFound("Usuário já verificado.");

            const decodedToken = JWT.validateAuth(account.emailVerificationToken);
            if (!decodedToken) throw ThrowError.notFound("Token inválido.");

            accountFound.emailVerificationToken = null;
            accountFound.verified = true;

            const updatedAccount = await authRepository.updateVerificationToken(accountFound);
            if (!updatedAccount) throw ThrowError.notFound("Usuário não encontrado.");

            return accountMapper(accountFound);
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

            await authRepository.updateVerificationToken({
                _id: account._id,
                emailVerificationToken: token,
                verified: account.verified
            } as IAccount);

            await sendEmail({
                to: email,
                subject: "🔒 Recuperação de Senha - MyPets",
                text: `Olá!\n\nRecebemos uma solicitação para redefinir sua senha.\nUse este link para criar uma nova senha: http://localhost:3000/reset-password?token=${token}\n\nSe você não solicitou, ignore este email.`,
                html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
        <h2 style="color: #333;">🔒 Recuperação de Senha</h2>
        <p>Olá!</p>
        <p>Recebemos uma solicitação para redefinir sua senha.</p>
        <p style="text-align: center;">
            <a href="http://localhost:3000/reset-password?token=${token}" 
               style="display: inline-block; padding: 12px 20px; color: #fff; background-color: #4CAF50; text-decoration: none; border-radius: 5px; font-weight: bold;">
               Redefinir Senha
            </a>
        </p>
        <p>Se você não solicitou a redefinição, pode ignorar este email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #888;">Equipe MyPets</p>
    </div>
    `
            }).catch(err => { throw ThrowError.internal("Não foi possivel enviar o email.") });


        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Não foi possível redefinir a senha.");
        }
    }
}

