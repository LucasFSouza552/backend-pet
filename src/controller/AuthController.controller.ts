import { Request, Response, NextFunction } from "express";
import { ThrowError } from "@errors/ThrowError";
import { AuthService } from "@services/AuthService.services";
import { validatePassword } from "@utils/aes-crypto";
import JWT from "@utils/JwtEncoder";
import { AccountDTO, CreateAccountDTO } from "@dtos/AccountDTO";
import BuilderDTO from "@utils/builderDTO";

const authService = new AuthService();

export default class AuthController {
    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = req.body;
            if (!data.email || !data.password) {
                throw ThrowError.badRequest("É necessário prencher todos os campos.")
            }

            const account = await authService.getByEmail(data.email);
            if (!account) {
                throw ThrowError.notFound("Email ou senha inválidos");
            }
            const passwordEncoded = await validatePassword(data.password, account.password);
            if (!passwordEncoded) {
                throw ThrowError.unauthorized("Email ou senha inválidos");
            }
            const token = JWT.encodeToken({ id: account._id });

            res.status(200).json({ token });

        } catch (error) {
            next(error);
        }
    }

    async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const accountId = req.account?.id as string;
            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                throw ThrowError.badRequest("É necesario preencher todos os campos.");
            }

            if (currentPassword === newPassword) {
                throw ThrowError.badRequest("Nova senha deve ser diferente da atual.");
            }

            await authService.changePassword(accountId, { newPassword, currentPassword });
            res.status(200).json({ message: "Senha alterada com sucesso." });
        } catch (error) {
            next(error);
        }
    }

    async register(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = req?.body;

            if (data?.role === "admin") {
                throw ThrowError.forbidden("Acesso negado.");
            }

            const newAccountDTO: CreateAccountDTO = new BuilderDTO<CreateAccountDTO>(data)
                .add({ key: "email" })
                .add({ key: "password" })
                .add({ key: "name" })
                .add({ key: "role", required: false })
                .add({ key: "cpf", required: data?.role === "user" })
                .add({ key: "cnpj", required: data?.role === "institution" })
                .add({ key: "avatar", required: false })
                .add({ key: "phone_number" })
                .add({ key: "address.street" })
                .add({ key: "address.number", type: "number" })
                .add({ key: "address.complement", required: false })
                .add({ key: "address.city" })
                .add({ key: "address.cep" })
                .add({ key: "address.state" })
                .build();

            const newAccount: AccountDTO = await authService.create(newAccountDTO);

            res.status(201).json(newAccount);
        } catch (error) {
            next(error);
        }
    }

    async resendVerification(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {

        } catch (error) {
            next(error);
        }
    }

    async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const token = req?.query?.token;

            if (!token || typeof token !== "string") {
                throw ThrowError.badRequest("Verificação inválida.");
            }

            const account = await authService.verifyEmail(token);
            res.status(200).json(account);
        } catch (error) {
            next(error);
        }
    }

    async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {

        } catch (error) {
            next(error);
        }
    }

    async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const email = req.body?.email;
            if (!email) {
                throw ThrowError.badRequest("É necesario preencher todos os campos.");
            }

            await authService.forgotPassword(email);
            res.status(200).json({ message: "Email enviado com sucesso." });
        } catch (error) {
            next(error);
        }
    }

    async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { token, password } = req.body;
            if (!token || !password) {
                throw ThrowError.badRequest("É necesario preencher todos os campos.");
            }

            await authService.resetPassword(token, password);

            res.status(200).json({ message: "Senha alterada com sucesso." });
        } catch (error) {
            next(error);
        }
    }
}