import { connectDB } from "../config/db";
import { seedAchievements } from "./achievements.seed";
import { seedPosts } from "./posts.seed";
import { seedAccounts } from "./users.seed";
import dotenv from "dotenv";
dotenv.config();


async function runSeeds() {
    try {
        await connectDB();

        // Seeds to test code
        await seedAccounts();
        await seedAchievements();
        await seedPosts();

        console.log("All seeds executed successfully ✅");
        process.exit(0);
    } catch (error) {
        console.error("Error running seeds:", error);
        process.exit(1);
    }
}

runSeeds();
