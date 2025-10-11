import { NextFunction, Request, Response } from "express";
import { PictureStorageRepository } from "../repositories/PictureStorage.repository";
import { ThrowError } from "../errors/ThrowError";

export class PictureStorangeController {
    async getPicture(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.params.id) {
                throw ThrowError.badRequest("ID não foi informado.");
            }
            const picture = await PictureStorageRepository.downloadImage(req.params.id as string);
            if (!picture) {
                throw ThrowError.notFound("Imagem não encontrada.");
            }
            picture.on("error", (error) => next(error));

            res.setHeader("Content-Type", "image/jpeg");
            res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
            res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
            picture.pipe(res);
        } catch (error) {
            next(error);
        }
    }
}