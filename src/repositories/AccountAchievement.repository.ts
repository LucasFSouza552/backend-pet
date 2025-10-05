import { addAchieviment } from "./../dtos/AccountAchievementDTO";
import { AccountAchievement } from "../models/AccountAchievement";

export default class AccountAchievementRepository {
    async getByAccountId(accountId: string) {
        return await AccountAchievement.find({ account: accountId });
    }

    async addAchieviment(achievements: addAchieviment) {
        return await AccountAchievement.create(achievements);
    }
   
}