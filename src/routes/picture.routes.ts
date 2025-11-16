import { Router } from "express";
import { PictureStorageController } from "@controller/pictureStorage.controller";

const router = Router();

const pictureStorageController = new PictureStorageController();

router.get("/:id", pictureStorageController.getPicture);

export default router;