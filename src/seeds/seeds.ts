import { connectDB } from "@config/db";
import { initGridFS } from "@config/gridfs";
import { seedAchievements } from "@seeds/achievements.seed";
import { seedComments } from "@seeds/comments.seed";
import { seedPets } from "@seeds/pets.seed";
import { seedPosts } from "@seeds/posts.seed";
import { seedAccounts } from "@seeds/accounts.seed";
import { seedNotifications } from "@seeds/notification.seed";
import { seedHistories } from "@seeds/history.seed";
import { seedAccountAchievements } from "@seeds/accountAchievement.seed";
import { deletePicturesInChunks } from "@seeds/pictures.seed";
import dotenv from "dotenv";
dotenv.config();


async function runSeeds() {
    try {
        await connectDB();
        await initGridFS();

        await deletePicturesInChunks(100);

        await seedAccounts();
        await seedAchievements();
        await seedPosts();
        await seedComments();
        await seedPets();
        await seedNotifications();
        await seedHistories();
        await seedAccountAchievements();
        console.log("All seeds executed successfully");
        process.exit(0);
    } catch (error) {
        console.error("Error running seeds:", error);
        process.exit(1);
    }
}

runSeeds();
