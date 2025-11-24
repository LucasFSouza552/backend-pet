import { FilterQuery, Types } from "mongoose";
import Filter from "@interfaces/Filter";
import IRepository from "@interfaces/IRepository";
import IPost, { Post } from "@models/post";
import { CreatePostDTO, UpdatePostDTO } from "@dtos/postDTO";
import { Account } from "@models/account";
import { PostWithAccount } from "@Itypes/ITypePost";
import postMapper from "@Mappers/postMapper";

const t = [];

export default class PostRepository implements IRepository<CreatePostDTO, UpdatePostDTO, IPost> {
    async getTopPosts() {
        const posts = await Post.find({ deletedAt: null }).sort({ likes: -1 }).limit(5);
        return posts;
    }
    async softDelete(id: string) {
        const post = await Post.findByIdAndUpdate(id, { deletedAt: Date.now() });
    }
    async getPostsByAccount(account: string) {
        return await Post.find({ account, deletedAt: null });
    }

    async getPostWithAuthor(id: string): Promise<PostWithAccount> {
        const post = await Post.findOne({ _id: id, deletedAt: null })
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
        console.log(post);
        return post as unknown as PostWithAccount;
    }

    async getPostsWithAuthor(filter: Filter) {
        const { page, limit, orderBy, order, query } = filter;

        if (query?.accountId && !Types.ObjectId.isValid(query.accountId)) {
            delete query.accountId;
        }
        const posts = await Post.find({ ...query } as FilterQuery<IPost>)
            .sort({ [orderBy]: order, createdAt: -1 })
            .skip((page - 1) * limit)
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
        const post = await Post.find(query as FilterQuery<IPost>)
            .sort({ [orderBy]: order, _id: 1 })
            .skip((page - 1) * limit)
            .limit(limit);
        return post;
    }
    async getById(id: string): Promise<IPost | null> {
        const post = await Post.findById(id)
            .lean({ virtuals: true })
            .exec();

        return postMapper(post as unknown as IPost);
    }

    async create(data: CreatePostDTO): Promise<IPost> {

        const post = new Post(data);
        await post.save();

        await Account.findByIdAndUpdate(data.account, { $inc: { postCount: 1 } });

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
        const countPosts = await Post.find({ account }).countDocuments();

        await Account.findByIdAndUpdate(account, { postCount: countPosts });
        return countPosts;
    }

    async search(filter: Filter): Promise<IPost[]> {
        const { page, limit, orderBy, order, query } = filter;
        const words = filter?.query?.content ? filter.query.content.trim().split(/\s+/) : [];
        const regexConditions = words.map((word: string) => ({
            content: { $regex: word, $options: "i" }
        }));

        return await Post.find({ $and: regexConditions })
            .sort({ [orderBy]: order, _id: 1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate("account");
    }
}