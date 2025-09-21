import { Schema } from "mongoose";
import IPost from "../models/Post";

export type CreatePostDTO = Omit<IPost, "data" | "likes">;

export type UpdatePostDTO = Partial<Omit<IPost, "createdAt" | "updatedAt" | "date" | "likes" | "author" | "authorModel">>;