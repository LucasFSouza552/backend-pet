import IPost from "@models/Post";

export type CreatePostDTO = Omit<IPost, "data" | "likes">;

export type UpdatePostDTO = Partial<Omit<IPost, "createdAt" | "updatedAt" | "date" | "likes">>;

export type UpdatePostlikesDTO = Pick<IPost, "likes">;