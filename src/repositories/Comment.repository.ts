import { FilterQuery } from "mongoose";
import Filter from "@interfaces/Filter";
import IRepository from "@interfaces/IRepository";
import IComment, { Comment } from "@models/Comments";
import { CommentsWithAuthors, CreateCommentDTO, UpdateCommentDTO } from "@dtos/CommentDTO";

export default class CommentRepository implements IRepository<CreateCommentDTO, UpdateCommentDTO, IComment> {
    async getReplies(commentId: string, filter: Filter): Promise<IComment[] | null> {
        const replies = await Comment.find({ parent: commentId }).sort({ createdAt: 1 });
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
        console.log(id);
        return await Comment.findById(id);
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
        return await Comment.find({ account: accountId, post: postId });
    }
    async delete(id: string): Promise<void> {
        await Comment.findByIdAndDelete(id);
    }
}
