import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const user = process.env.MONGO_USER;
const pass = process.env.MONGO_PASS;
const dbName = process.env.MONGO_DB;
const cluster = process.env.MONGO_CLUSTER;


export const connectDB = async () => {

    const uri = `mongodb+srv://${user}:${pass}@${cluster}/${dbName}?retryWrites=true&w=majority`;
    
    if (!uri) {
        console.log("❌ MongoDB: sem conexão", uri);
        process.exit(1);
    }
    
    try {
        await mongoose.connect(uri);

        // testar banco
        const state = mongoose.connection.readyState;

        switch (state) {
            case 0:
                console.log("❌ MongoDB: desconectado");
                break;
            case 1:
                console.log("✅ MongoDB: conectado");
                break;
            case 2:
                console.log("⏳ MongoDB: conectando...");
                break;
            case 3:
                console.log("⚠️ MongoDB: desconectando");
                break;
        }

        console.log("MongoDB connected");
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};