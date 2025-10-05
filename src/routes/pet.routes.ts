import { Router } from "express";

const router = Router();

import PetController from "../controller/Pet.controller";
import AuthMiddleware from "../middleware/authMiddleware";
import authorizationMiddleware from "../middleware/authorizationMiddleware";
const petController = new PetController();

router.get("/", AuthMiddleware, authorizationMiddleware(["institution", "admin"]), petController.getAll);
router.post("/", AuthMiddleware, authorizationMiddleware(["institution"]), petController.create);
router.patch("/:id", AuthMiddleware, authorizationMiddleware(["institution"]), petController.update);
router.delete("/:id", AuthMiddleware, authorizationMiddleware(["institution"]), petController.delete);

router.get("/avaliable", AuthMiddleware, petController.getAvailable);
router.get("/:id", AuthMiddleware, petController.getById);
router.post("/:id/adopt", AuthMiddleware, petController.requestAdoption);
router.post("/:id/sponsor", AuthMiddleware, petController.sponsor);

export default router;