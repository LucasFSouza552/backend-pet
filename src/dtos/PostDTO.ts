import { Schema } from "mongoose";

export interface createPostDTO {
    title: string;
    image?: Buffer;
    content: string;
    author: Schema.Types.ObjectId;
    date: Date;
}

export interface updatePostDTO {
    title?: string;
    image?: Buffer;
    content?: string;
}