import IComment from "../models/Comments";

export type CreateCommentDTO = Omit<IComment, "createdAt" | "updatedAt">;
export type UpdateCommentDTO = Partial<Omit<IComment, "createdAt" | "updatedAt" | "postId" | "accountId">>;