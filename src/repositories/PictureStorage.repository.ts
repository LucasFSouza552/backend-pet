
import { gfs } from "../config/gridfs";
import { GridFSBucketReadStream, ObjectId } from "mongodb";

export class PictureStorageRepository {
    static async uploadImage(file: Express.Multer.File): Promise<ObjectId | null> {
        if(!file || !file.buffer) return null;
        return new Promise<ObjectId>((resolve, reject) => {
            if (!gfs) return null;
            const uploadStream = gfs.openUploadStream(file.originalname, {
                contentType: file.mimetype,
            });
            uploadStream.end(file.buffer);

            uploadStream.on("finish", () => resolve(uploadStream.id as unknown as ObjectId));
            uploadStream.on("error", reject);
        });
    }

    static deleteImage(fileId: string | ObjectId): Promise<void> {
        if (!gfs) return Promise.resolve();

        const mongoId = typeof fileId === "string" ? new ObjectId(fileId) : fileId;

        return gfs.delete(mongoId);
    }

    static async downloadImage(fileId: string | ObjectId): Promise<GridFSBucketReadStream | null> {
        if (!gfs) return null;
        const mongoId = typeof fileId === "string" ? new ObjectId(fileId) : fileId;
        return gfs.openDownloadStream(mongoId);
    }
}