import { IAccount } from "@models/Account";
import { IAccountAchievement } from "@models/AccountAchievement";
import IPost from "@models/Post";

export type PostWithAccount = IPost & {
    account: IAccount & { achievements?: IAccountAchievement[] };
};