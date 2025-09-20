import { Request, Response, NextFunction } from "express";
import IController from "../interfaces/IController";
import { ThrowError } from "../errors/ThrowError";
import { AccountService } from "../services/account.services";
import Filter from "../interfaces/Filter";
import filterConfig from "../utils/filterConfig";
import { updateAccountDTO, AccountDTO } from "../dtos/AccountDTO";
import BuilderDTO from "../utils/builderDTO";
import { IAccount } from "../models/Account";
import { validatePassword } from "../utils/aes-crypto";
import JWT from "../utils/JwtEncoder";

const accountService = new AccountService();

export default class AccountController implements IController {
    async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.accountId;
            console.log(id);
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
            const newAccountDTO = new BuilderDTO<IAccount>(req.body)
                .add("email", "string")
                .add("password", "password")
                .add("name")
                .add("avatar")
                .add("address.street")
                .add("address.number", "number")
                .add("address.complement")
                .add("address.city")
                .add("address.cep")
                .add("address.state")
                .build();

            if (!newAccountDTO.email || !newAccountDTO.password) {
                throw ThrowError.badRequest("Email e senha obrigatórios.");
            }

            const newAccount: AccountDTO = await accountService.create(req.body);

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

            const updateData: updateAccountDTO = new BuilderDTO(req.body)
                .add("name")
                .add("password", "password")
                .add("address.street")
                .add("address.number", "number")
                .add("address.complement")
                .add("address.city")
                .add("address.cep")
                .add("address.state")
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

            res.status(200).json({ token, account: account });

        } catch (error) {
            next(error);
        }
    }
}