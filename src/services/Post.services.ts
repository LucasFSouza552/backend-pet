
import { ObjectId } from "mongodb";
import { CreatePostDTO, UpdatePostDTO } from "../dtos/PostDTO";
import { ThrowError } from "../errors/ThrowError";
import Filter from "../interfaces/Filter";
import IService from "../interfaces/IService";
import IPost from "../models/Post";
import PostRepository from "../repositories/Post.repository";
import { PictureStorageRepository } from "../repositories/PictureStorage.repository";

const postRepository = new PostRepository();

export class PostService implements IService<CreatePostDTO, UpdatePostDTO, IPost> {

    async getPostsByAccount(accountId: string) {
        try {
            return await postRepository.getPostsByAccount(accountId);
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Não foi possível buscar os posts.");
        }
    }
    async getPostsWithAuthor(filter: Filter): Promise<IPost[]> {
        try {
            const posts = await postRepository.getPostsWithAuthor(filter);
            const post = posts.map((post) => ({ ...post, id: post?._id.toString() } as IPost));
            return post;
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Não foi possível buscar os posts.");
        }
    }
    async toggleLike(postId: string, accountId: string): Promise<IPost | null> {
        try {
            if (!postId || !accountId) return null;
            const post = await postRepository.getById(postId);
            if (!post) return null;

            const alreadyLiked = post.likes.some((id) => id.equals(accountId));
            
            return alreadyLiked
                ? await postRepository.removeLike(postId, accountId)
                : await postRepository.addLike(postId, accountId);;
        } catch (error: any) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Não foi possível curtir o post.");
        }
    }
    updateComment(accountId: string, updateData: UpdatePostDTO): Promise<IPost | null> {
        try {
            return postRepository.update(accountId, updateData);
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Não foi possível atualizar o comentário.");
        }
    }
    async getAll(filter: Filter): Promise<IPost[]> {
        try {
            const posts = await postRepository.getAll(filter);
            return posts;
        } catch (error: any) {
            console.log(error);
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Não foi possível buscar os posts.");
        }
    }

    async getById(id: string): Promise<IPost | null> {
        try {
            return await postRepository.getById(id);
        } catch (error: any) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Não foi possível buscar o post.");
        }
    }

    async create(data: CreatePostDTO, files?: Express.Multer.File[]): Promise<IPost> {
        const images: ObjectId[] = [];
        try {
            if (files && files.length > 0) {
                for (const file of files) {
                    const id = await PictureStorageRepository.uploadImage(file);
                    if(!id) continue;
                    images.push(id);
                }
            }
            data.image = images;
            return await postRepository.create(data);
        } catch (error: any) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Não foi possível criar o post.");
        }
    }

    async update(id: string, data: UpdatePostDTO): Promise<IPost | null> {
        try {
            return await postRepository.update(id, data);
        } catch (error: any) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Não foi possível atualizar o post.");
        }
    }

    async delete(id: string): Promise<void> {
        try {
            return await postRepository.delete(id);
        } catch (error: any) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Não foi possível deletar o post.");
        }
    }
    // async getStatusByAccount(postId: string): Promise<number> {
    //     try {
    //         const postCount = await postRepository.getCountPosts(postId);

            
    //         return postCount;

    //     } catch (error) {
    //         if (error instanceof ThrowError) throw error;
    //         throw ThrowError.internal("Não foi possível buscar o post.");
    //     }
    // }
}