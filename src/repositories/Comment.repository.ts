import { FilterQuery } from "mongoose";
import Filter from "@interfaces/Filter";
import IRepository from "@interfaces/IRepository";
import IComment, { Comment } from "@models/Comments";
import { CreateCommentDTO, UpdateCommentDTO } from "@dtos/CommentDTO";

export default class CommentRepository implements IRepository<CreateCommentDTO, UpdateCommentDTO, IComment> {
    async getReplies(commentId: string) {
        const replies = await Comment.find({ parent: commentId }).sort({ createdAt: 1 }).lean();

        return replies
    }

    async getByPostId(postId: string) {
        return await Comment
            .find({ post: postId, isDeleted: false, parent: null })
            .sort({ createdAt: 1 });
    }
    async softDelete(accountId: string, id: string): Promise<IComment | null> {
        return await Comment.findByIdAndUpdate(
            id,
            { isDeleted: true },
            { new: true }
        );
    }
    async getAll(filter: Filter): Promise<IComment[]> {
        const { page, limit, orderBy, order, query } = filter;

        return await Comment.find(query as FilterQuery<IComment>)
            .sort({ [orderBy]: order })
            .skip((page - 1) * limit)
            .limit(limit);
    }
    async getById(id: string): Promise<IComment | null> {
        return await Comment.findById(id);
    }
    async create(data: CreateCommentDTO): Promise<IComment> {
        const comment = new Comment(data);
        await comment.save();
        return comment;
    }
    async update(id: string, data: UpdateCommentDTO): Promise<IComment | null> {
        const updatedComment = await Comment.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true
        });
        return updatedComment;
    }
    async getAccountComments(accountId: string, postId: string): Promise<IComment[]> {
        return await Comment.find({ account: accountId, post: postId });
    }
    async delete(id: string): Promise<void> {
        await Comment.findByIdAndDelete(id);
    }
}
