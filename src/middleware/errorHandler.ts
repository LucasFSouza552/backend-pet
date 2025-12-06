import { NextFunction, Request, Response } from "express";
import { errorResponse } from "@utils/apiResponse";
import { ThrowError } from "@errors/ThrowError";

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error("Error:", err);

    if (err instanceof ThrowError) {
        return res.status(err.statusCode).json(
            errorResponse(err.message)
        );
    }

    if (err.name === "ValidationError") {
        return res.status(401).json(
            errorResponse("Erro de validação", err.errors)
        );
    }

    if (err.name === "CastError") {
        return res.status(400).json(
            errorResponse("ID inválido")
        );
    }

    return res.status(500).json(
        errorResponse("Erro interno do servidor")
    );
};