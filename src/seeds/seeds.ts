import { connectDB } from "../config/db";
import { seedUsers } from "./users.seed";
import { seedInstitutions } from "./institutions.seed";
import dotenv from "dotenv";
dotenv.config();


async function runSeeds() {
    try {
        await connectDB();

        // Seeds to test code
        await seedUsers();
        await seedInstitutions();

        console.log("All seeds executed successfully ✅");
        process.exit(0);
    } catch (error) {
        console.error("Error running seeds:", error);
        process.exit(1);
    }
}

runSeeds();
