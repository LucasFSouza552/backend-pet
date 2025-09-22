import { Router } from "express";

const router = Router();

import PetController from "../controller/Pet.controller";
import AuthMiddleware from "../middleware/authMiddleware";
import authorizationMiddleware from "../middleware/authorizationMiddleware";
const petController = new PetController();

router.get("/", petController.getAll);
router.get("/:id", petController.getById);
router.post("/", AuthMiddleware, authorizationMiddleware(["institution"]), petController.create);
router.patch("/:id", AuthMiddleware, authorizationMiddleware(["institution"]), petController.update);
router.delete("/:id", AuthMiddleware, authorizationMiddleware(["institution"]), petController.delete);

export default router;