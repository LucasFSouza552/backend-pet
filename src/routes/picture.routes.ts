import { Router } from "express";
import { PictureStorangeController } from "@controller/PictureStorage.controller"; 

const router = Router();

const pictureStorageController = new PictureStorangeController();

router.get("/:id", pictureStorageController.getPicture);

export default router;