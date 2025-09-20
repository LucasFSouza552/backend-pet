import { NextFunction, Request, Response } from "express";
import JWT from "../utils/JwtEncoder";

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
            throw new Error("Token not found. Use format Bearer <token>");
        }

        const decodedToken = JWT.validateAuth(authHeader);
        if (!decodedToken) {
             throw new Error("Invalid token. Use format Bearer <token>");
        }
        req.accountId = decodedToken.id;

        if (req.accountId) {
             throw new Error("Invalid token. Use format Bearer <token>");
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }

    next();
}