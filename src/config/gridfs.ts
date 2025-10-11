import mongoose from "mongoose";

export let gfs: mongoose.mongo.GridFSBucket | null = null;

export const initGridFS = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 1) {
    await new Promise<void>((resolve) => {
      mongoose.connection.once("open", resolve);
    });
  }

  if (!mongoose.connection.db) throw new Error("MongoDB connection not ready");

  gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: "pictures",
  });

  console.log("✅ GridFS pronto!");
};
