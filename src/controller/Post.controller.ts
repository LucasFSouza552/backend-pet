import { NextFunction, Request, Response } from "express";
import { PostService } from "../services/Post.services";
import Filter from "../interfaces/Filter";
import filterConfig from "../utils/filterConfig";
import IController from "../interfaces/IController";

const postService = new PostService();

export default class PostController implements IController {
    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const allowedQueryFields: string[] = ["title", "content", "date", "likes", "image"];
            const filters: Filter = filterConfig(req.query, allowedQueryFields);

            const posts = await postService.getAll(filters);
            res.status(200).json(posts);
            return;
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id;
            if (!id) {
                throw new Error("ID não foi informado.");
            }
            const post = await postService.getById(id);
            res.status(200).json(post);
        } catch (error) {
            next(error);
        }
    }

    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const post = await postService.create(req.body);
            res.status(201).json(post);
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
            const post = await postService.update(id, req.body);
            res.status(200).json(post);
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
            await postService.delete(id);
            res.status(204).json();
        } catch (error) {
            next(error);
        }
    }
}