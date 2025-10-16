import { addAchieviment } from "@dtos/AccountAchievementDTO";
import { AccountAchievement } from "@models/AccountAchievement";

export default class AccountAchievementRepository {
    async getByAccountId(account: string) {
        return await AccountAchievement.find({ account }).populate("achievement");
    }

    async addAchieviment(achievements: addAchieviment) {
        return await AccountAchievement.create(achievements);
    }

}