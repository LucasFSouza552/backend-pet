import { Request, Response, NextFunction } from "express";
import IController from "../interfaces/IController";
import { ThrowError } from "../errors/ThrowError";
import Filter from "../interfaces/Filter";
import filterConfig from "../utils/filterConfig";
import { UpdateAccountDTO, AccountDTO, CreateAccountDTO } from "../dtos/AccountDTO";
import BuilderDTO from "../utils/builderDTO";
import { validatePassword } from "../utils/aes-crypto";
import JWT from "../utils/JwtEncoder";
import { AccountService } from "../services/account.services";

const accountService = new AccountService();

export default class AccountController implements IController {
    async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.accountId;
            if (!id) {
                throw ThrowError.badRequest("ID não foi informado.");
            }
            const account = await accountService.getById(id);
            res.status(200).json(account);
        } catch (error) {
            next(error);
        }
    }

    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const allowedQueryFields: string[] = ["email", "name", "address.city", "address.state", "address.cep"];
            const filters: Filter = filterConfig(req.query, allowedQueryFields);

            const accounts = await accountService.getAll(filters);
            res.status(200).json(accounts);
            return;
        } catch (error: any) {
            next(error);
        }
    }
    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id;
            if (!id) {
                throw ThrowError.badRequest("ID não foi informado.");
            }
            const account = await accountService.getById(id);
            res.status(200).json(account);
        } catch (error) {
            next(error);
        }
    }
    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {

            const data = req?.body;
            const newAccountDTO: CreateAccountDTO = new BuilderDTO<CreateAccountDTO>(data)
                .add({ key: "email" })
                .add({ key: "password" })
                .add({ key: "name" })
                .add({ key: "role", required: false })
                .add({ key: "cpf", required: data?.role === "user" || data?.role === "admin" })
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

            const newAccount: AccountDTO = await accountService.create(newAccountDTO);

            res.status(201).json(newAccount);
        } catch (error: any) {
            next(error);
        }
    }
    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id;
            if (!id) {
                throw ThrowError.badRequest("ID não foi informado.");
            }

            const updateData = new BuilderDTO<UpdateAccountDTO>(req.body)
                .add({ key: "name", required: false })
                .add({ key: "address.street", required: false })
                .add({ key: "phone_number", required: false })
                .add({ key: "address.number", type: "number", required: false })
                .add({ key: "address.complement", required: false })
                .add({ key: "address.city", required: false })
                .add({ key: "address.cep", required: false })
                .add({ key: "address.state", required: false })
                .build();

            const account = await accountService.update(id, updateData);
            res.status(200).json(account);
        } catch (error) {
            next(error);
        }
    }
    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id;
            if (!id) {
                throw ThrowError.badRequest("ID não foi informado.");
            }
            await accountService.delete(id);
            res.status(204).json();
        } catch (error) {
            next(error);
        }
    }
    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = req.body;
            if (!data.email || !data.password) {
                throw ThrowError.badRequest("É necessário prencher todos os campos.")
            }

            const account = await accountService.getByEmail(data.email);
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
            const accountId = req.accountId as string;
            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                throw ThrowError.badRequest("É necesario preencher todos os campos.");
            }

            await accountService.changePassword(accountId, { newPassword, currentPassword });
            res.status(204).json();
        } catch (error) {
            next(error);
        }
    }

    async updateAvatar(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const accountId = req.accountId as string;
            const file = req.file;
            if (!file) {
                throw ThrowError.badRequest("Nenhum arquivo foi enviado.");
            }

            const avatar = await accountService.updateAvatar(accountId, file);
            res.status(200).json({ avatar });
        } catch (error) {
            next(error);
        }
    }
}