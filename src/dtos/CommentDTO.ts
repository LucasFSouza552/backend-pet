import { IAccount } from "@models/Account";
import IComment from "@models/Comments";
import { IAccountPopulated } from "./AccountDTO";

export type CreateCommentDTO = Omit<IComment, "createdAt" | "updatedAt">;
export type UpdateCommentDTO = Partial<Omit<IComment, "createdAt" | "updatedAt" | "post">>;

export type CommentsWithAuthors = Omit<IComment, "account"> & {
    account: IAccountPopulated;
};