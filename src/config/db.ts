import mongoose from "mongoose";
import dotenv from "dotenv";
import { initGridFS } from "./gridfs";
dotenv.config();

const user = process.env.MONGO_USER;
const pass = process.env.MONGO_PASS;
const dbName = process.env.MONGO_DB;
const cluster = process.env.MONGO_CLUSTER;
const prod = process.env.NODE_ENV === "production";

export const connectDB = async () => {
    const MONGO_URL = process.env.MONGO_URL;
    const uri = prod ? `mongodb+srv://${user}:${pass}@${cluster}/${dbName}?retryWrites=true&w=majority` : MONGO_URL;

    if (!uri) {
        console.log("❌ MongoDB: sem conexão", uri);
        process.exit(1);
    }

    console.log(uri);

    try {
        await mongoose.connect(uri);

        // testar banco
        const state = mongoose.connection.readyState;

        switch (state) {
            case 0:
                console.log("❌ MongoDB: desconectado");
                break;
            case 1:
                console.log(`✅ MongoDB: conectado ${prod ? "online" : "local"}`);
                break;
            case 2:
                console.log("⏳ MongoDB: conectando...");
                break;
            case 3:
                console.log("⚠️ MongoDB: desconectando");
                break;
        }

        await initGridFS();
        console.log("MongoDB connected");
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};