import { FilterQuery } from "mongoose";
import Filter from "../interfaces/Filter";
import IRepository from "../interfaces/IRepository";
import IPost, { Post } from "../models/Post";
import { ThrowError } from "../errors/ThrowError";

export default class PostRepository implements IRepository<IPost> {
    async getAll(filter: Filter): Promise<IPost[]> {
        try {
            const { page, limit, orderBy, order, query } = filter;

            return await Post.find(query as FilterQuery<IPost>)
                .sort({ [orderBy]: order })
                .skip((page - 1) * limit)
                .limit(limit);

        } catch (error: any) {
            throw ThrowError.internal("Erro ao buscar os posts.");
        }
    }
    async getById(id: string): Promise<IPost> {
        try {
            const post = await Post.findById(id);
            if (!post) {
                throw ThrowError.notFound("Post não encontrado.");
            }
            return post;
        } catch (error: any) {
            throw ThrowError.internal("Erro ao buscar o post.");
        }
    }
    async create(data: IPost): Promise<IPost> {
        try {
            const post = new Post(data);
            await post.save();
            return post;
        } catch (error: any) {
            if (error.name === "ValidationError") {
                throw ThrowError.badRequest("Dados inválidos: " + error.message);
            }
            if (error.code === 11000) {
                throw ThrowError.conflict("Post já cadastrado.");
            }
            throw ThrowError.internal("Erro ao criar o post.");
        }
    }
    async update(id: string, data: IPost): Promise<IPost> {
        try {
            const post = await Post.findById(id);
            if (!post) {
                throw ThrowError.notFound("Post não encontrado.");
            }
            const updatedPost = await Post.findByIdAndUpdate(id, data, {
                new: true,
                runValidators: true
            });
            if (!updatedPost) {
                throw ThrowError.internal("Erro ao atualizar o post.");
            }
            return updatedPost;
        } catch (error: any) {
            if (error.name === "CastError") {
                throw ThrowError.badRequest("ID inválido.");
            }
            if (error.name === "ValidationError") {
                throw ThrowError.badRequest("Dados inválidos: " + error.message);
            }
            if (error.code === 11000) {
                throw ThrowError.conflict("Post já cadastrado.");
            }
            throw ThrowError.internal("Erro ao atualizar o post.");
        }
    }
    async delete(id: string): Promise<void> {
        try {
            const post = await Post.findByIdAndDelete(id);
            if (!post) {
                throw ThrowError.notFound("Post não encontrado.");
            }
        } catch (error: any) {
            throw ThrowError.internal("Erro ao deletar o post.");
        }
    }
}