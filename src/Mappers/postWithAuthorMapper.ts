import { IAccount } from "@models/account";
import { IAccountAchievement } from "@models/accountAchievement";
import { IAchievement } from "@models/achievements";
export interface PostWithAccount {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    
    account: IAccount & {achievement: IAccountAchievement[]};
}

export function mapPostWithAuthor(post: any): PostWithAccount {
    try {
        const account = post.account as IAccount & { achievements?: IAccountAchievement[] };

    const achievements = account?.achievements?.map((a: { achievement: any; createdAt: any; }) => {
        const ach = a.achievement as IAchievement;
        return {
            ...ach,
            obtainedAt: a.createdAt,
        };
    }) ?? [];

    return {
        ...post,
        id: post._id,
        account: {
            ...account,
            achievements: achievements,
        },
    };
    } catch (error) {
        console.error("Error mapping post with author:", error);
        throw error;
    }
}
