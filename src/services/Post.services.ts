import { ThrowError } from "../errors/ThrowError";
import Filter from "../interfaces/Filter";
import IService from "../interfaces/IService";
import IPost from "../models/Post";
import PostRepository from "../repositories/Post.repository";

const postRepository = new PostRepository();

export class PostService implements IService<IPost> {
    async getAll(filter: Filter): Promise<IPost[]> {
        try {
            return postRepository.getAll(filter);
        } catch (error: any) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Erro ao buscar os posts.");
        }
    }

    async getById(id: string): Promise<IPost> {
        try {
            return await postRepository.getById(id);
        } catch (error: any) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Erro ao buscar o post.");
        }
    }

    async create(data: IPost): Promise<IPost> {
        try {
            const post = await postRepository.create(data);
            if (post) throw ThrowError.conflict("Post já cadastrado.");
            return post;
        } catch (error: any) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Não foi possível criar o post.");
        }
    }

    async update(id: string, data: IPost): Promise<IPost> {
        try {
            return await postRepository.update(id, data);
        } catch (error: any) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Não foi possível atualizar o post.");
        }
    }

    async delete(id: string): Promise<void> {
        try {
            return await postRepository.delete(id);
        } catch (error: any) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Não foi possível deletar o post.");
        }
    }
}