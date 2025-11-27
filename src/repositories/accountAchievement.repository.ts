import { addAchievement } from "@dtos/accountAchievementDTO";
import { AccountAchievement } from "@models/accountAchievement";

export default class AccountAchievementRepository {
    async getByAccountId(account: string) {
        return await AccountAchievement.find({ account }).populate("achievement");
    }

    async addAchievement(achievements: addAchievement) {
        return await AccountAchievement.create(achievements);
    }

    async existsByAccountAndAchievement(account: string, achievement: string): Promise<boolean> {
        const existing = await AccountAchievement.findOne({ account, achievement });
        return !!existing;
    }

}