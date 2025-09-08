import { connectDB } from "../config/db";
import { seedUsers } from "./users.seed";
import dotenv from "dotenv";
dotenv.config();


async function runSeeds() {
    try {
        await connectDB();

        // Seeds para testar código
        await seedUsers();

        console.log("Todas seeds executadas com sucesso ✅");
        process.exit(0);
    } catch (error) {
        console.error("Erro ao rodar seeds:", error);
        process.exit(1);
    }
}

runSeeds();
