import { NextFunction, Request, Response } from "express";
import Filter from "../interfaces/Filter";
import IController from "../interfaces/IController";
import filterConfig from "../utils/filterConfig";
import { CommentService } from "../services/Comment.services";

const commentService = new CommentService();

export class CommentController implements IController {
    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id;
            if (!id) {
                throw new Error("ID não foi informado.");
            }
            const comment = await commentService.getById(id);
            res.status(200).json(comment);
        } catch (error: any) {
            next(error);
        }
    }
    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const allowedQueryFields: string[] = ["postId", "author", "content", "date", "likes"];
            const filters: Filter = filterConfig(req.query, allowedQueryFields);

            const comments = await commentService.getAll(filters);
            res.status(200).json(comments);
        } catch (error) {
            next(error);
        }
    }
    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const comment = await commentService.create(req.body);
            res.status(201).json(comment);
        } catch (error) {
            next(error);
        }
    }
    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id;
            if (!id) {
                throw new Error("ID não foi informado.");
            }
            const comment = await commentService.update(id, req.body);
            res.status(200).json(comment);
        } catch (error) {
            next(error);
        }
    }
    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id;
            if (!id) {
                throw new Error("ID não foi informado.");
            }
            await commentService.delete(id);
            res.status(204).json();
        } catch (error) {
            next(error);
        }
    }
}