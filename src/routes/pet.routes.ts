import { Router } from "express";

const router = Router();

import PetController from "../controller/Pet.controller";
import AuthMiddleware from "../middleware/authMiddleware";
import authorizationMiddleware from "../middleware/authorizationMiddleware";
import upload from "../config/multer.config";
const petController = new PetController();

router.get("/feed", AuthMiddleware, petController.getFeed);
router.get("/", AuthMiddleware, authorizationMiddleware(["institution", "admin"]), petController.getAll);
router.post("/", AuthMiddleware, authorizationMiddleware(["institution"]), petController.create);
router.patch("/:id", AuthMiddleware, authorizationMiddleware(["institution"]), petController.update);
router.delete("/:id", AuthMiddleware, authorizationMiddleware(["institution"]), petController.delete);

router.get("/avaliable", AuthMiddleware, petController.getAvailable);
router.get("/:id", AuthMiddleware, petController.getById);
router.post("/:id/adopt", AuthMiddleware, petController.requestAdoption);
router.post("/:id/sponsor", AuthMiddleware, petController.sponsor);

router.post("/:id/avatar", AuthMiddleware, authorizationMiddleware(["institution"]),upload.array("avatar", 6), petController.updatePetImages);
router.delete("/:id/avatar/:imageId", AuthMiddleware, authorizationMiddleware(["institution"]), petController.deletePetImage);

export default router;