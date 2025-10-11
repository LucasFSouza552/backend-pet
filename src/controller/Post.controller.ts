import { NextFunction, Request, Response } from "express";
import { PostService } from "../services/Post.services";
import Filter from "../interfaces/Filter";
import filterConfig from "../utils/filterConfig";
import IController from "../interfaces/IController";
import { ThrowError } from "../errors/ThrowError";
import { CreatePostDTO, UpdatePostDTO } from "../dtos/PostDTO";
import BuilderDTO from "../utils/builderDTO";
import AccountService from "../services/Account.services";
import IPost from "../models/Post";
import { gfs } from "../config/gridfs";

const postService = new PostService();
const accountService = new AccountService();

export default class PostController implements IController {

    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const allowedQueryFields: string[] = ["title", "accountId", "date", "likes", "image"];
            const filters: Filter = filterConfig<IPost>(req.query, allowedQueryFields);

            const posts = await postService.getAll(filters);
            res.status(200).json(posts);
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
            const post = await postService.getById(id);
            console.log(post);
            res.status(200).json(post);
        } catch (error) {
            next(error);
        }
    }

    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        const post = req?.body;
        try {
            post.account = req?.account?.id;

            const images = req.files as Express.Multer.File[];
            post.image = [];

            if (!gfs) {
                res.status(500).json({ error: "GridFS não inicializado" });
                return;
            }

            const newPostDTO: CreatePostDTO = new BuilderDTO<CreatePostDTO>(post)
                .add({ key: "title" })
                .add({ key: "content" })
                .add({ key: "account" })
                .build();

            const newPost: CreatePostDTO = await postService.create(newPostDTO, images);
            res.status(201).json(newPost);
        } catch (error) {
            if (post.image && post.image.length > 0 && gfs) {
                for (const fileId of post.image) {
                    try {
                        await gfs.delete(fileId);
                    } catch (err) {
                        console.error("Erro ao remover imagem do GridFS:", err);
                    }
                }
            }
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id;
            if (!id) {
                throw ThrowError.badRequest("ID não foi informado.");
            }
            const updateData = new BuilderDTO<UpdatePostDTO>(req.body)
                .add({ key: "title", required: false })
                .add({ key: "content", required: false })
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
            console.log(post);
            res.status(200).json(post);
        } catch (error) {
            next(error);
        }
    }

    async getPostsWithAuthor(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const allowedQueryFields: string[] = ["title", "account", "date", "likes", "image"];
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
}