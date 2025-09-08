import mongoose from "mongoose";


export const connectDB = async () => {

    const { MONGO_URL } = process.env;
    if (!MONGO_URL) {
        console.log("❌ MongoDB: sem conexão", MONGO_URL);
        process.exit(1);
    }

    try {
        await mongoose.connect(MONGO_URL);

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