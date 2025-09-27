import { FilterQuery } from "mongoose";
import Filter from "../interfaces/Filter";
import IRepository from "../interfaces/IRepository";
import IComment, { Comment } from "../models/Comments";
import { ThrowError } from "../errors/ThrowError";
import { CreateCommentDTO, UpdateCommentDTO } from "../dtos/CommentDTO";

export default class CommentRepository implements IRepository<CreateCommentDTO, UpdateCommentDTO, IComment> {
    async getAll(filter: Filter): Promise<IComment[]> {
        try {
            const { page, limit, orderBy, order, query } = filter;

            return await Comment.find(query as FilterQuery<IComment>)
                .sort({ [orderBy]: order })
                .skip((page - 1) * limit)
                .limit(limit);
        } catch (error: any) {
            throw ThrowError.internal("Erro ao buscar os comentários.");
        }
    }
    async getById(id: string): Promise<IComment> {
        try {
            const comment = await Comment.findById(id);
            if (!comment) {
                throw ThrowError.notFound("Comentário não encontrado.");
            }
            return comment;
        } catch (error: any) {
            throw ThrowError.internal("Erro ao buscar o comentário.");
        }
    }
    async create(data: CreateCommentDTO): Promise<IComment> {
        try {
            const comment = new Comment(data);
            await comment.save();
            return comment;
        } catch (error: any) {
            throw ThrowError.internal("Erro ao criar o comentário.");
        }
    }
    async update(id: string, data: UpdateCommentDTO): Promise<IComment> {
        try {
            const comment = await Comment.findById(id);
            if (!comment) {
                throw ThrowError.notFound("Comentário não encontrado.");
            }
            const updatedComment = await Comment.findByIdAndUpdate(id, data, {
                new: true,
                runValidators: true
            });
            if (!updatedComment) {
                throw ThrowError.internal("Erro ao atualizar o comentário.");
            }
            return updatedComment;
        } catch (error: any) {
            if (error.name === "CastError") {
                throw ThrowError.badRequest("ID inválido.");
            }
            throw ThrowError.internal("Erro ao atualizar o comentário.");
        }
    }
    async getAccountComments(accountId: string, postId: string): Promise<IComment[]> {
        try {
            return await Comment.find({ accountId, postId });
        } catch (error: any) {
            throw ThrowError.internal("Erro ao buscar os comentários da conta.");
        }
    }
    async delete(id: string): Promise<void> {
        try {
            const comment = await Comment.findById(id);
            if (!comment) {
                throw ThrowError.notFound("Comentário não encontrado.");
            }
            await Comment.findByIdAndDelete(id);
        } catch (error: any) {
            if (error.name === "CastError") {
                throw ThrowError.badRequest("ID inválido.");
            }
            throw ThrowError.internal("Erro ao deletar o comentário.");
        }
    }
}
