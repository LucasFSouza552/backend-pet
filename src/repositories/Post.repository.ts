import { FilterQuery, Types } from "mongoose";
import Filter from "@interfaces/Filter";
import IRepository from "@interfaces/IRepository";
import IPost, { Post } from "@models/Post";
import { CreatePostDTO, UpdatePostDTO } from "@dtos/PostDTO";

export default class PostRepository implements IRepository<CreatePostDTO, UpdatePostDTO, IPost> {

    async getPostsByAccount(account: string) {
        return await Post.find({ account });
    }
    async getPostsWithAuthor(filter: Filter) {
        const { page, limit, orderBy, order, query } = filter;

        if (query?.accountId && !Types.ObjectId.isValid(query.accountId)) {
            delete query.accountId;
        }
        const posts = await Post.find(query as FilterQuery<IPost>)
            .sort({ [orderBy]: order })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate({ path: "account", select: "name role avatar" })
            .lean()
            .exec();

        return posts;
    }
    async addLike(postId: string, accountId: string): Promise<IPost | null> {
        return await Post.findByIdAndUpdate(
            postId,
            { $addToSet: { likes: new Types.ObjectId(accountId) } },
            { new: true }
        ).populate({ path: "account", select: "name role avatar" });
    }
    async removeLike(postId: string, accountId: string): Promise<IPost | null> {
        return await Post.findByIdAndUpdate(
            postId,
            { $pull: { likes: new Types.ObjectId(accountId) } },
            { new: true }
        ).populate({ path: "account", select: "name role avatar" });
    }
    async getAll(filter: Filter): Promise<IPost[]> {
        const { page, limit, orderBy, order, query } = filter;

        if (query?.account && !Types.ObjectId.isValid(query.account)) {
            delete query.account;
        }

        return await Post.find(query as FilterQuery<IPost>)
            .sort({ [orderBy]: order })
            .skip((page - 1) * limit)
            .limit(limit);
    }
    async getById(id: string): Promise<IPost | null> {
        const post = await Post.findById(id)
            .populate({
                path: "comments",
                match: { isDeleted: false },
                populate: [
                    { path: "account", select: "name avatar" },
                    { path: "parentId", select: "content account" }
                ]
            })
            .populate("account", "name role avatar")
            .lean({ virtuals: true })
            .exec();
        return post;
    }
    async create(data: CreatePostDTO): Promise<IPost> {

        const post = new Post(data);
        await post.save();
        return post;
    }
    async update(id: string, data: UpdatePostDTO): Promise<IPost | null> {
        const updatedPost = await Post.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true
        });
        return updatedPost;
    }
    async delete(id: string): Promise<void> {
        await Post.findByIdAndDelete(id);
    }

    async getCountPosts(account: string): Promise<number> {
        return await Post.find({ account }).countDocuments();
    }

    async search(filter: Filter): Promise<IPost[]> {
        const words = filter?.query?.title ? filter.query.title.trim().split(/\s+/) : [];
        const regexConditions = words.map((word: string) => ({
            title: { $regex: word, $options: "i" }
        }));

        return await Post.find({ $and: regexConditions });
    }
}