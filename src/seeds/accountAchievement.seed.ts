import { Account } from "@models/account";
import { Achievements } from "@models/achievements";
import { AccountAchievement } from "@models/accountAchievement";

export const seedAccountAchievements = async () => {
    await AccountAchievement.deleteMany({});

    const users = await Account.find({ role: "user" }).limit(5);
    const achievements = await Achievements.find();

    if (users.length === 0 || achievements.length === 0) {
        console.log("AccountAchievements seed skipped: Need users and achievements first");
        return;
    }

    const accountAchievements = [];

    for (let i = 0; i < users.length; i++) {
        const user = users[i];
        if (!user) continue;

        if (i === 0) {
            for (const achievement of achievements) {
                accountAchievements.push({
                    account: user._id,
                    achievement: achievement._id,
                });
            }
        }
        else if (i === 1) {
            const donationAchievement = achievements.find(a => a.type === "donation");
            if (donationAchievement) {
                accountAchievements.push({
                    account: user._id,
                    achievement: donationAchievement._id,
                });
            }
        }
        else if (i === 2) {
            const sponsorshipAchievement = achievements.find(a => a.type === "sponsorship");
            if (sponsorshipAchievement) {
                accountAchievements.push({
                    account: user._id,
                    achievement: sponsorshipAchievement._id,
                });
            }
        }
        else if (i === 3) {
            const adoptionAchievement = achievements.find(a => a.type === "adoption");
            if (adoptionAchievement) {
                accountAchievements.push({
                    account: user._id,
                    achievement: adoptionAchievement._id,
                });
            }
        }
    }

    await AccountAchievement.create(accountAchievements);

    console.log("AccountAchievements seed executed");
};

