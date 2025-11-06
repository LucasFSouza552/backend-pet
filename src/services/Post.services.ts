import { ObjectId } from "mongodb";

// DTOS
import { CreatePostDTO, UpdatePostDTO } from "@dtos/PostDTO";

// Errors
import { ThrowError } from "@errors/ThrowError";

// Interfaces
import Filter from "@interfaces/Filter";
import IService from "@interfaces/IService";

// Models
import IPost from "@models/Post";

// Repositories
import { PictureStorageRepository } from "@repositories/PictureStorage.repository";
import { postRepository } from "@repositories/index";
import postMapper from "@Mappers/postMapper";
import { IAchievement } from "@models/Achievements";
import { IAccount } from "@models/Account";
import { IAccountAchievement } from "@models/AccountAchievement";
import { PostWithAccount } from "@Itypes/ITypePost";
import { mapPostWithAuthor } from "@Mappers/postWithAuthorMapper";

export default class PostService implements IService<CreatePostDTO, UpdatePostDTO, IPost> {
    async getTopPosts() {
        try {
            return await postRepository.getTopPosts();
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Não foi possível buscar os posts.");
        }
    }
    async softDelete(id: string, accountId: string) {
        try {
            const post = await postRepository.getById(id);
            if(!post) {
                throw ThrowError.notFound("A publicação não foi encontrada.");
            }
            if (post?.deletedAt) {
                throw ThrowError.conflict("A publicação já foi deletada.");
            }
            if (post?.account?.toString() !== accountId) return null;
            
            return postRepository.softDelete(id);
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Não foi possível deletar o post.");
        }
    }

    async getPostsByAccount(accountId: string) {
        try {
            return await postRepository.getPostsByAccount(accountId);
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Não foi possível buscar os posts.");
        }
    }

    async getPostWithAuthor(postId:string) {
        try {
            
            const post = await postRepository.getPostWithAuthor(postId);
            return mapPostWithAuthor(post);
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Não foi possível buscar o post")
        }
    }
    async getPostsWithAuthor(filter: Filter): Promise<PostWithAccount[]> {
        try {
            const posts = await postRepository.getPostsWithAuthor(filter);
            const postMapped = posts.map(post => {
                const account = post.account as unknown as IAccount & { achievements?: IAccountAchievement[]; };

                const achievements = account.achievements?.map(a => {
                    const ach = a.achievement as unknown as IAchievement;
                    return {
                        ...ach,
                        obtainedAt: a.createdAt
                    };
                }) ?? [];

                return {
                    ...post,
                    id: post._id,
                    account: { ...account, id: account._id, achievements: achievements }
                };
            }) as unknown as PostWithAccount[];


            return postMapped;
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

            const updatedPost = alreadyLiked
                ? await postRepository.removeLike(postId, accountId)
                : await postRepository.addLike(postId, accountId);
            if (!updatedPost) return null;
            return postMapper(updatedPost);
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
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Não foi possível buscar os posts.");
        }
    }

    async getById(id: string): Promise<IPost | null> {
        try {

            const post = await postRepository.getById(id);
            if (!post) return null;
            return postMapper(post);
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
                    if (!id) continue;
                    images.push(id);
                }
            }
            data.image = images;
            return await postRepository.create(data);
        } catch (error: any) {
            if (error instanceof ThrowError) throw error;
            console.error(error);
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

    async search(filter: Filter): Promise<IPost[]> {
        try {
            return await postRepository.search(filter);
        } catch (error: any) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Não foi possível buscar os posts.");
        }
    }
}