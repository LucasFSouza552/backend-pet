import { FilterQuery, Types } from "mongoose";
import Filter from "../interfaces/Filter";
import IRepository from "../interfaces/IRepository";
import IPost, { Post } from "../models/Post";
import { CreatePostDTO, UpdatePostDTO } from "../dtos/PostDTO";

export default class PostRepository implements IRepository<CreatePostDTO, UpdatePostDTO, IPost> {
    async addLike(postId: string, accountId: string): Promise<IPost | null> {
        return await Post.findByIdAndUpdate(
            postId,
            { $addToSet: { likes: new Types.ObjectId(accountId) } },
            { new: true }
        );
    }
    async removeLike(postId: string, accountId: string): Promise<IPost | null> {
        return await Post.findByIdAndUpdate(
            postId,
            { $pull: { likes: new Types.ObjectId(accountId) } },
            { new: true }
        );
    }
    async getAll(filter: Filter): Promise<IPost[]> {
        const { page, limit, orderBy, order, query } = filter;

        return await Post.find(query as FilterQuery<IPost>)
            .sort({ [orderBy]: order })
            .skip((page - 1) * limit)
            .limit(limit);
    }
    async getById(id: string): Promise<IPost | null> {
        const post = await Post.findById(id);
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
}