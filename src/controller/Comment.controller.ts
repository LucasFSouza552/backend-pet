import { NextFunction, Request, Response } from "express";
import Filter from "../interfaces/Filter";
import IController from "../interfaces/IController";
import filterConfig from "../utils/filterConfig";
import { CommentService } from "../services/Comment.services";
import { CreateCommentDTO } from "../dtos/CommentDTO";
import BuilderDTO from "../utils/builderDTO";
import { ThrowError } from "../errors/ThrowError";
import { UpdateCommentDTO } from "../dtos/CommentDTO";

const commentService = new CommentService();

export class CommentController implements IController {
    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id;
            if (!id) {
                throw ThrowError.badRequest("ID não foi informado.");
            }
            const comment = await commentService.getById(id);
            res.status(200).json(comment);
        } catch (error: any) {
            next(error);
        }
    }
    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const allowedQueryFields: string[] = ["postId", "author", "date", "likes"];
            const filters: Filter = filterConfig(req.query, allowedQueryFields);

            const comments = await commentService.getAll(filters);
            res.status(200).json(comments);
        } catch (error) {
            next(error);
        }
    }
    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const accountId = req.accountId;
            const comment = req?.body;
            comment.accountId = accountId;
            const newCommentDTO: CreateCommentDTO = new BuilderDTO<CreateCommentDTO>(comment)
                .add({ key: "postId" })
                .add({ key: "accountId" })
                .add({ key: "content" })
                .build();
            const newComment: CreateCommentDTO = await commentService.create(newCommentDTO);
            res.status(201).json(newComment);
        } catch (error) {
            next(error);
        }
    }
    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id;
            if (!id) {
                throw ThrowError.badRequest("ID não foi informado.");
            }
            const updateData = new BuilderDTO<UpdateCommentDTO>(req.body)
                .add({ key: "content", required: false })
                .build();
            const comment = await commentService.update(id, updateData);
            
            res.status(200).json(comment);
        } catch (error) {
            next(error);
        }
    }
    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id;
            if (!id) {
                throw ThrowError.badRequest("ID não foi informado.");
            }
            await commentService.delete(id);
            res.status(204).json();
        } catch (error) {
            next(error);
        }
    }
}