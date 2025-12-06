import jwt, { JwtPayload, SignOptions, verify } from "jsonwebtoken";
import { ThrowError } from "@errors/ThrowError";

export default class JWT {

    static encodeToken(data: object, expiresIn: SignOptions["expiresIn"] = "1d"): string {
        const JWT_SECRET: string = process.env.JWT_SECRET as string;
        return jwt.sign({ data }, JWT_SECRET, { expiresIn });
    }


    static validateAuth(authToken: string) {
        if (!authToken) {
            throw ThrowError.badRequest('Sessão inválida');
        }

        const [scheme, token] = authToken.split(" ");
        if (!token || scheme != 'Bearer') {
            throw ThrowError.unauthorized('Sessão inválida')
        }
        try {
            const payload = this.isJwtTokenValid(token)
            if (!payload) {
                throw ThrowError.unauthorized('Sessão expirada')
            }

            return payload;
        } catch (error) {
            if (error instanceof ThrowError) {
                throw error;
            }
            throw ThrowError.internal('Erro interno ocorreu');
        }
    }

    static isJwtTokenValid(token: string) {
        try {
            const JWT_SECRET: string = process.env.JWT_SECRET as string;
            return verify(token, JWT_SECRET) as JwtPayload;
        } catch (error) {
            throw ThrowError.unauthorized('Sessão expirada');
        }
    }

}