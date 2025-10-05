import { NextFunction, Request, Response } from "express";
import Filter from "../interfaces/Filter";
import IController from "../interfaces/IController";
import filterConfig from "../utils/filterConfig";
import { CommentService } from "../services/Comment.services";
import { ThrowError } from "../errors/ThrowError";
import BuilderDTO from "../utils/builderDTO";
import { CreateCommentDTO } from "../dtos/CommentDTO";
import { UpdateCommentDTO } from "../dtos/CommentDTO";

const commentService = new CommentService();

export class CommentController implements IController {
    async getReplies(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const commentId = req.params.id;
            if (!commentId) {
                throw ThrowError.badRequest("ID do comentário não foi informado.");
            }

            const replies = await commentService.getReplies(commentId);
            res.status(200).json(replies);
        } catch (error) {
            next(error);
        }
    }
    async getAllByPost(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { postId } = req.params;
            if (!postId) {
                throw ThrowError.badRequest("ID do post não foi informado.");
            }

            const comments = commentService.getAllByPost(postId);
            res.status(200).json(comments);
        } catch (error) {
            next(error);
        }
    }
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
            const comment = req?.body;

            comment.account = req.account?.id;
            const newCommentDTO: CreateCommentDTO = new BuilderDTO<CreateCommentDTO>(comment)
                .add({ key: "postId" })
                .add({ key: "account" })
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
            const accountId = req.account?.id as string;
            if(!accountId) throw ThrowError.badRequest("Conta não encontrada.");
            const id = req.params.id;
            if (!id) {
                throw ThrowError.badRequest("ID não foi informado.");
            }
            const data  = {...req.body, account: accountId};
            const updateData = new BuilderDTO<UpdateCommentDTO>(data)
                .add({ key: "content" })
                .add({ key: "account" })
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

    async reply(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const comment = req?.body;
            comment.account = req.account?.id;
            comment.parentId = req.params?.id;

            const newCommentDTO: CreateCommentDTO = new BuilderDTO<CreateCommentDTO>(comment)
                .add({ key: "account" })
                .add({ key: "parentId" })
                .add({ key: "content" })
                .build();

            const newComment: CreateCommentDTO = await commentService.reply(newCommentDTO);
            res.status(201).json(newComment);
        } catch (error) {
            next(error);
        }
    }

    async deleteOwnComment(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const accountId = req.account?.id;
            const id = req.params.id;
            if (!id || !accountId) {
                throw ThrowError.badRequest("ID não foi informado.");
            }
            const deletedComment = await commentService.deleteOwnComment(accountId, id);
            res.status(200).json({ comment: deletedComment });
        } catch (error) {
            next(error);
        }
    }
}