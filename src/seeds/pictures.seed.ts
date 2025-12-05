import { gfs } from "@config/gridfs";
import mongoose from "mongoose";

export const deletePicturesInChunks = async (chunkSize: number = 100) => {
    if (!gfs) {
        console.log("GridFS não está inicializado. Pulando limpeza de pictures.");
        return;
    }

    try {
        const db = mongoose.connection.db;
        if (!db) {
            throw new Error("MongoDB connection not ready");
        }

        const picturesCollection = db.collection("pictures.files");
        const totalPictures = await picturesCollection.countDocuments();
        
        if (totalPictures === 0) {
            console.log("Nenhuma picture encontrada para deletar");
            return;
        }

        console.log(`Iniciando deleção de ${totalPictures} pictures em chunks de ${chunkSize}...`);

        let deletedCount = 0;
        let skip = 0;

        while (skip < totalPictures) {
            const pictures = await picturesCollection
                .find({})
                .skip(skip)
                .limit(chunkSize)
                .toArray();

            if (pictures.length === 0) {
                break;
            }

            const deletePromises = pictures.map((picture) => {
                return gfs?.delete(picture._id);
            });

            await Promise.all(deletePromises);
            deletedCount += pictures.length;
            skip += chunkSize;

            console.log(`Deletadas ${deletedCount}/${totalPictures} pictures...`);
        }

        console.log(`${deletedCount} pictures deletadas com sucesso`);
    } catch (error) {
        console.error("Erro ao deletar pictures:", error);
        throw error;
    }
};

