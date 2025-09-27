import { CreatePostDTO, UpdatePostDTO } from "../dtos/PostDTO";
import { ThrowError } from "../errors/ThrowError";
import Filter from "../interfaces/Filter";
import IService from "../interfaces/IService";
import IPost from "../models/Post";
import PostRepository from "../repositories/Post.repository";

const postRepository = new PostRepository();
export class PostService implements IService<CreatePostDTO, UpdatePostDTO, IPost> {
    updateComment(accountId: string, updateData: UpdatePostDTO): Promise<IPost> {
        try {
            
            return postRepository.update(accountId, updateData);
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Não foi possível atualizar o comentário.");
        }
    }
    async getAll(filter: Filter): Promise<IPost[]> {
        try {
            return await postRepository.getAll(filter);
        } catch (error: any) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Não foi possível buscar os posts.");
        }
    }

    async getById(id: string): Promise<IPost> {
        try {
            return await postRepository.getById(id);
        } catch (error: any) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Não foi possível buscar o post.");
        }
    }

    async create(data: CreatePostDTO): Promise<IPost> {
        try {
            const post = await postRepository.create(data);
            if (post) throw ThrowError.conflict("Post já existente.");
            return post;
        } catch (error: any) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Não foi possível criar o post.");
        }
    }

    async update(id: string, data: UpdatePostDTO): Promise<IPost> {
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