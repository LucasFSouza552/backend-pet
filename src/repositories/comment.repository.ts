import { FilterQuery } from "mongoose";
import Filter from "@interfaces/Filter";
import IRepository from "@interfaces/IRepository";
import IComment, { Comment } from "@models/comments";
import { CommentsWithAuthors, CreateCommentDTO, UpdateCommentDTO } from "@dtos/commentDTO";

export default class CommentRepository implements IRepository<CreateCommentDTO, UpdateCommentDTO, IComment> {
    async getReplies(commentId: string, filter: Filter): Promise<IComment[] | null> {
        const replies = await Comment.find({ parent: commentId, deletedAt: null }).sort({ createdAt: 1 });
        return replies;
    }

    async getByPostId(post: string, filter: Filter): Promise<CommentsWithAuthors[]> {
        const { page, limit, orderBy, query } = filter;

        const comment = await Comment
            .find({ post, deletedAt: null, parent: null })
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate({
                path: "account",
                select: "name role avatar verified",
                populate: [{
                    path: "achievements",
                    model: "AccountAchievement",
                    select: "createdAt",
                    populate: {
                        path: "achievement",
                        model: "Achievement",
                        select: "name type description"
                    }
                }, {
                    path: "postCount"
                }]
            })
            .lean({ virtuals: true })
            .exec();
        return comment as unknown as CommentsWithAuthors[];
    }
    async softDelete(accountId: string, id: string): Promise<IComment | null> {
        return await Comment.findByIdAndUpdate(
            id,
            { deletedAt: new Date() },
            { new: true }
        );
    }
    async getAll(filter: Filter): Promise<IComment[]> {
        const { page, limit, orderBy, order, query } = filter;

        return await Comment.find({ ...query, deletedAt: null } as FilterQuery<IComment>)
            .sort({ [orderBy]: order, _id: 1 })
            .skip((page - 1) * limit)
            .limit(limit);
    }
    async getById(id: string): Promise<IComment | null> {
        return await Comment.findOne({ _id: id, deletedAt: null });
    }

    async create(data: CreateCommentDTO): Promise<IComment> {
        const comment = new Comment(data);

        await comment.save();

        await comment.populate({
            path: "account",
            select: "name role avatar verified",
            populate: [
                {
                    path: "achievements",
                    model: "AccountAchievement",
                    select: "createdAt",
                    populate: {
                        path: "achievement",
                        model: "Achievement",
                        select: "name type description"
                    }
                },
                {
                    path: "postCount"
                }
            ]
        });

        return comment.toObject({ virtuals: true });

    }
    async update(id: string, data: UpdateCommentDTO): Promise<IComment | null> {
        const updatedComment = await Comment.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true
        });
        return updatedComment;
    }
    async getAccountComments(accountId: string, postId: string): Promise<IComment[]> {
        return await Comment.find({ account: accountId, post: postId, deletedAt: null });
    }
    async delete(id: string): Promise<void> {
        await Comment.findByIdAndUpdate(id, { deletedAt: new Date() });
    }
}
