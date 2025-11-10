import { ThrowError } from "@errors/ThrowError";
import { NextFunction, Request, Response } from "express";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

export const uploadPicture = upload.single("picture");

export default function pictureMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const file = req.file;
        if (!file) {
            throw ThrowError.badRequest("Deve inserir uma imagem!");
        }

        next();
    } catch (error) {
        next(error);
    }
}
