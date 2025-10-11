import { Request, Response, Router } from "express";

const router = Router();

import { PictureStorangeController } from "../controller/PictureStorage.controller";
const pictureStorageController = new PictureStorangeController();

router.get("/:id", pictureStorageController.getPicture);

export default router;