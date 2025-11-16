import { NextFunction, Request, Response } from "express";
import JWT from "@utils/JwtEncoder";
import { ThrowError } from "@errors/ThrowError";
import { AccountDTO } from "@dtos/accountDTO";

import { accountService } from "@services/index";

declare global {
    namespace Express {
        interface Request {
            account?: AccountDTO;
        }
    }
}


export default async function AuthMiddleware(req: Request, res: Response, next: NextFunction) {

    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            throw ThrowError.badRequest("Token não encontrado. Use formato Bearer <token>");
        }

        const decodedToken = JWT.validateAuth(authHeader);
        if (!decodedToken) {
            throw ThrowError.unauthorized("Token inválido. Use formato Bearer <token>");
        }
        const accountId = decodedToken?.data?.id;
        if (!accountId) {
            throw ThrowError.notFound("Token inválido. Use formato Bearer <token>");
        }

        const account = await accountService.getById(accountId);
        if (!account) {
            throw ThrowError.notFound("Usuário não encontrado.");
        }
        req.account = account;


        next();
    } catch (error) {
        next(error); // Testar depois se o Next vai para o próximo middleware de tratamento de erro
    }
}
