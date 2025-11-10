import { Router } from "express";
import { PictureStorangeController } from "@controller/PictureStorage.controller"; 
import pictureMiddleware, { uploadPicture } from "@middleware/pictureMiddleware";


const router = Router();

const pictureStorageController = new PictureStorangeController();

router.get("/:id", pictureStorageController.getPicture);
router.post("/", uploadPicture, pictureMiddleware, pictureStorageController.setPicture);

export default router;