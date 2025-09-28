import { FilterQuery } from "mongoose";
import Filter from "../interfaces/Filter";
import IRepository from "../interfaces/IRepository";
import IComment, { Comment } from "../models/Comments";
import { CreateCommentDTO, UpdateCommentDTO } from "../dtos/CommentDTO";

export default class CommentRepository implements IRepository<CreateCommentDTO, UpdateCommentDTO, IComment> {
    async getAll(filter: Filter): Promise<IComment[]> {
        const { page, limit, orderBy, order, query } = filter;

        return await Comment.find(query as FilterQuery<IComment>)
            .sort({ [orderBy]: order })
            .skip((page - 1) * limit)
            .limit(limit);
    }
    async getById(id: string): Promise<IComment | null> {
        const comment = await Comment.findById(id);
        return comment;
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
        return await Comment.find({ accountId, postId });
    }
    async delete(id: string): Promise<void> {
        await Comment.findByIdAndDelete(id);
    }
}
