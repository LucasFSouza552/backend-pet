import { IAccount } from "@models/account";
import { IAccountAchievement } from "@models/accountAchievement";
import IPost from "@models/post";

export type PostWithAccount = IPost & {
    account: IAccount & { achievements?: IAccountAchievement[] };
};