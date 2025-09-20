import { NextFunction, Request, Response } from "express";
import JWT from "../utils/JwtEncoder";
import { ThrowError } from "../errors/ThrowError";

declare global {
    namespace Express {
        interface Request {
            accountId?: string;
        }
    }
}

export default function AuthMiddleware(req: Request, res: Response, next: NextFunction) {

    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            throw ThrowError.badRequest("Token not found. Use format Bearer <token>");
        } 

        console.log(authHeader);
        

        const decodedToken = JWT.validateAuth(authHeader);
        if (!decodedToken) {
            throw ThrowError.unauthorized("Invalid token. Use format Bearer <token>");
        }
        req.accountId = decodedToken.id;

        console.log(decodedToken);

        if (req.accountId) {
            throw ThrowError.notFound("Invalid token. Use format Bearer <token>");
        }
    } catch (error) {
        next(error); // Testar depois se o Next vai para o proximo middleware de tratamento de erro
    }

    next();
}