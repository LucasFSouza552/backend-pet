import { ThrowError } from "@errors/ThrowError";
import { IAccount } from "@models/account";
import AccountService from "@services/account.services";
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
            next(error);
        }
    }
}