// DTOS
import { CommentsWithAuthors, CreateCommentDTO, UpdateCommentDTO } from "@dtos/commentDTO";

// Errors
import { ThrowError } from "@errors/ThrowError";

/// Interfaces
import Filter from "@interfaces/Filter";
import IService from "@interfaces/IService";

// Models
import IComment from "@models/comments";

// Repositories
import { postRepository, commentRepository } from "@repositories/index";
import { accountService } from "./index";
import { mapCommentsWithAuthor } from "@Mappers/commentsWithAuthorMapper";

export default class CommentService implements IService<CreateCommentDTO, UpdateCommentDTO, IComment> {

    async getReplies(commentId: string, filter: Filter): Promise<IComment[]> {
        try {
            const replies = await commentRepository.getReplies(commentId, filter);
            
            if (!replies) return [];
            return replies.map(reply => ({ ...reply, account: reply.account ?? null })) as unknown as IComment[];

        } catch (error) {
            if (error instanceof Error) throw error;
            throw ThrowError.internal("Não foi possivel obter os comentários.");
        }
    }

    async getAllByPost(postId: string, filter: Filter): Promise<CommentsWithAuthors[]> {
        try {
            const comments = await commentRepository.getByPostId(postId, filter);
            
            return comments.map(mapCommentsWithAuthor);
        } catch (error) {
            if (error instanceof Error) throw error;
            throw ThrowError.internal("Não foi possivel obter os comentários.");
        }
    }
    async softDelete(accountId: string, commentId: string): Promise<IComment | null> {
        try {
            const comment = await commentRepository.getById(commentId);
            if (!comment) {
                throw ThrowError.notFound("Comentário não encontrado.");
            }
            if (comment?.account?.toString() !== accountId) {
                throw ThrowError.forbidden("Acesso negado.");
            }

            return await commentRepository.softDelete(accountId, commentId);
        } catch (error: any) {
            if (error instanceof Error) throw error;
            throw ThrowError.internal("Não foi possível deletar o comentário.");
        }
    }

    async reply(data: CreateCommentDTO): Promise<IComment> {
        try {
            const account = await accountService.getById(data.account as string);
            if (!account) {
                throw ThrowError.badRequest("Conta associada ao comentário não existe.");
            }

            if (!data?.parent) {
                throw ThrowError.badRequest("Comentário pai deve ser informado.");
            }
            const commentParent = await commentRepository.getById(data.parent as string);
            if (!commentParent) {
                throw ThrowError.badRequest("Comentário pai associado ao comentário não existe.");
            }

            const post = await postRepository.getById(commentParent.post.toString());
            if (!post) {
                throw ThrowError.badRequest("Post associado ao comentário não existe.");
            };
            data.post = post.id;
            return await commentRepository.create(data);
        } catch (error: any) {
            if (error instanceof Error) throw error;
            throw ThrowError.internal("Não foi possível criar o comentário.");
        }
    }

    async create(data: CreateCommentDTO): Promise<IComment> {
        try {
            const account = await accountService.getById(data.account.toString());
            if (!account) {
                throw ThrowError.badRequest("Conta não encontrada.");
            }

            const post = await postRepository.getById(data.post.toString());
            if (!post) {
                throw ThrowError.badRequest("Post associado não existe.");
            };

            return await commentRepository.create(data);
        } catch (error: any) {
            if (error instanceof Error) throw error;
            throw ThrowError.internal("Não foi possível criar o comentário.");
        }
    }

    async update(id: string, data: UpdateCommentDTO): Promise<IComment | null> {
        try {
            const comment = await commentRepository.getById(id);
            if (!comment) {
                throw ThrowError.notFound("Comentário não encontrado.");
            }
            if (comment.account?.toString() !== data.account) {
                throw ThrowError.forbidden("Acesso negado.");
            }
            return await commentRepository.update(id, data);
        } catch (error: any) {
            if (error instanceof Error) throw error;
            throw ThrowError.internal("Não foi possível atualizar o comentário.");
        }
    }

    async delete(id: string): Promise<void> {
        try {
            return await commentRepository.delete(id);
        } catch (error: any) {
            if (error instanceof Error) throw error;
            throw ThrowError.internal("Não foi possível deletar o comentário.");
        }
    }

    async getAll(filter: Filter): Promise<IComment[]> {
        try {
            return await commentRepository.getAll(filter);
        } catch (error: any) {
            if (error instanceof Error) throw error;
            throw ThrowError.internal("Não foi possível buscar os comentários.");
        }
    }

    async getById(id: string): Promise<IComment | null> {
        try {
            return await commentRepository.getById(id);
        } catch (error: any) {
            if (error instanceof Error) throw error;
            throw ThrowError.internal("Não foi possível buscar o comentário.");
        }
    }
}