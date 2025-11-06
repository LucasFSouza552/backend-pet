import { NextFunction, Request, Response } from "express";

// DTOS
import { CreatePostDTO, UpdatePostDTO } from "@dtos/PostDTO";

// Interfaces
import Filter from "@interfaces/Filter";
import IController from "@interfaces/IController";

// Errors
import { ThrowError } from "@errors/ThrowError";

// Utils
import filterConfig from "@utils/filterConfig";
import BuilderDTO from "@utils/builderDTO";

// Models
import IPost from "@models/Post";

// Services
import { postService } from "@services/index";

export default class PostController implements IController {


    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const allowedQueryFields: string[] = ["title", "account", "createdAt", "likes", "image"];
            const filters: Filter = filterConfig<IPost>(req.query, allowedQueryFields);

            const posts = await postService.getAll(filters);
            res.status(200).json(posts);
        } catch (error) {
            next(error);
        }
    }


    async getPostWithAuthor(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id;
            if (!id) {
                throw ThrowError.badRequest("ID não foi informado.");
            }

            const post = await postService.getPostWithAuthor(id);
            res.status(200).json(post);
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id;

            if (!id || isNaN(parseInt(id))) {
                throw ThrowError.badRequest("ID não foi informado.");
            }
            const post = await postService.getById(id);
            res.status(200).json(post);
        } catch (error) {
            next(error);
        }
    }

    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const post = req?.body;
            post.account = req?.account?.id;

            const images = req.files as Express.Multer.File[];
            post.image = [];

            console.log(post);

            const newPostDTO: CreatePostDTO = new BuilderDTO<CreatePostDTO>(post)
                .add({ key: "title" })
                .add({ key: "content" })
                .add({ key: "image", required: false })
                .add({ key: "account" })
                .build();

            const newPost: CreatePostDTO = await postService.create(newPostDTO, images);
            res.status(201).json(newPost);
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
            const data = req.body;
            data.account = req.account?.id;

            const updateData = new BuilderDTO<UpdatePostDTO>(req.body)
                .add({ key: "title", required: false })
                .add({ key: "content", required: false })
                .add({ key: "account" })
                .build();
            const post = await postService.update(id, updateData);
            res.status(200).json(post);
        } catch (error) {
            next(error);
        }
    }

    async updateComment(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const accountId = req.account?.id;
            if (!accountId) {
                throw ThrowError.badRequest("ID não foi informado.");
            }
            const updateData = new BuilderDTO<UpdatePostDTO>(req.body)
                .add({ key: "title", required: false })
                .add({ key: "content", required: false })
                .add({ key: "image", required: false })
                .build();
            const post = await postService.updateComment(accountId, updateData);
            res.status(200).json(post);
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
            await postService.delete(id);
            res.status(204).json();
        } catch (error) {
            next(error);
        }
    }

    async toggleLike(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id;

            const accountId = req.account?.id.toString();
            if (!id || !accountId) {
                throw ThrowError.badRequest("ID não foi informado.");
            }

            const post = await postService.toggleLike(id, accountId);
            res.status(200).json(post);
        } catch (error) {
            next(error);
        }
    }

    async getPostsWithAuthor(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const allowedQueryFields: string[] = ["title", "account", "createdAt", "likes", "image"];
            const filters: Filter = filterConfig<IPost>(req.query, allowedQueryFields);
            const posts = await postService.getPostsWithAuthor(filters);

            res.status(200).json(posts);
        } catch (error) {
            next(error);
        }
    }


    async getPostsByAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const accountId = req.account?.id as string;
            const posts = await postService.getPostsByAccount(accountId);

            res.status(200).json(posts);
        } catch (error) {
            next(error);
        }
    }
    async search(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const allowedQueryFields: string[] = ["title"];
            const filters: Filter = filterConfig<IPost>(req.query, allowedQueryFields);

            const posts = await postService.search(filters);
            res.status(200).json(posts);
        } catch (error) {
            next(error);
        }
    }

    async softDelete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id;
            const accountId = req.account?.id as string;

            if (!accountId) {
                throw ThrowError.unauthorized("Usuário não autenticado.");
            }

            if (!id) {
                throw ThrowError.badRequest("ID não foi informado.");
            }

            await postService.softDelete(id, accountId);
            res.status(204).json();
        } catch (error) {
            next(error);
        }
    }

    async getTopPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const posts = await postService.getTopPosts();
            res.status(200).json(posts);
        } catch (error) {
            next(error);
        }
    }


}