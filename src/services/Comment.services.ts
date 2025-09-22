import { CreateCommentDTO, UpdateCommentDTO } from "../dtos/CommentDTO";
import { ThrowError } from "../errors/ThrowError";
import Filter from "../interfaces/Filter";
import IService from "../interfaces/IService";
import IComment from "../models/Comments";
import CommentRepository from "../repositories/Comment.repository";

const commentService = new CommentRepository();

export class CommentService implements IService<CreateCommentDTO, UpdateCommentDTO, IComment> {
    async create(data: CreateCommentDTO): Promise<IComment> {
        try {
            return commentService.create(data);
        } catch (error: any) {
            if (error instanceof Error) throw error;
            throw ThrowError.internal("Não foi possível criar o comentário.");
        }
    }

    async update(id: string, data: UpdateCommentDTO): Promise<IComment> {
        try {
            return await commentService.update(id, data);
        } catch (error: any) {
            if (error instanceof Error) throw error;
            throw ThrowError.internal("Não foi possível atualizar o comentário.");
        }
    }

    async delete(id: string): Promise<void> {
        try {
            return await commentService.delete(id);
        } catch (error: any) {
            if (error instanceof Error) throw error;
            throw ThrowError.internal("Não foi possível deletar o comentário.");
        }
    }

    async getAll(filter: Filter): Promise<IComment[]> {
        try {
            return await commentService.getAll(filter);
        } catch (error: any) {
            if (error instanceof Error) throw error;
            throw ThrowError.internal("Não foi possível buscar os comentários.");
        }
    }

    async getById(id: string): Promise<IComment> {
        try {
            return await commentService.getById(id);
        } catch (error: any) {
            if (error instanceof Error) throw error;
            throw ThrowError.internal("Não foi possível buscar o comentário.");
        }
    }
}