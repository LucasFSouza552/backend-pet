import { AccountDTO } from "../dtos/AccountDTO";
import { ThrowError } from "../errors/ThrowError";
import { IAccount } from "../models/Account";
import { AccountService } from "../services/Account.services";
import { NextFunction, Response, Request } from "express";

const accountService = new AccountService();

export default function authorizationMiddleware(allowedRoles: string[]) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {

            const accountId = req.account?.id;

            if (!accountId) {
                throw ThrowError.unauthorized("Usuário não autenticado");
            }

            const account = await accountService.getById(accountId) as IAccount;

            if (!account) {
                throw ThrowError.notFound("Usuário não existente");
            }

            if (!allowedRoles.includes(account.role)) {
                throw ThrowError.forbidden("Você não tem permissão para acessar este recurso.");
            }

            req.account = account;

            next();

        } catch (error: any) {
            if (error instanceof ThrowError) {
                res.status(error.statusCode).json({ error: error.message });
            } else {
                console.error(error);
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    }
}