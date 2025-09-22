import { NextFunction, Request, Response } from "express";
import JWT from "../utils/JwtEncoder";
import { ThrowError } from "../errors/ThrowError";
import { IAccount } from "../models/Account";

declare global {
    namespace Express {
        interface Request {
            accountId?: string;
            account?: IAccount;
        }
    }
}

export default function AuthMiddleware(req: Request, res: Response, next: NextFunction) {

    try {
        const authHeader = req.headers.authorization;
        console.log("Passou pelo authmiddleware");
        if (!authHeader) {
            throw ThrowError.badRequest("Token não encontrado. Use formato Bearer <token>");
        }

        const decodedToken = JWT.validateAuth(authHeader);
        if (!decodedToken) {
            throw ThrowError.unauthorized("Token inválido. Use formato Bearer <token>");
        }
        req.accountId = decodedToken?.data?.id;
        if (!req.accountId) {
            throw ThrowError.notFound("Token inválido. Use formato Bearer <token>");
        }
        next();
    } catch (error) {
        next(error); // Testar depois se o Next vai para o próximo middleware de tratamento de erro
    }
}