import { IAccount } from "@models/account";
import IComment from "@models/comments";
import { IAccountPopulated } from "./accountDTO";

export type CreateCommentDTO = Omit<IComment, "createdAt" | "updatedAt">;
export type UpdateCommentDTO = Partial<Omit<IComment, "createdAt" | "updatedAt" | "post">>;

export type CommentsWithAuthors = Omit<IComment, "account"> & {
    account: IAccountPopulated;
};