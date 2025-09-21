import { Router } from "express";

const router = Router();

import PetController from "../controller/Pet.controller";
const petController = new PetController();

router.get("/", petController.getAll);
router.get("/:id", petController.getById);
router.post("/", petController.create);
router.patch("/:id", petController.update);
router.delete("/:id", petController.delete);

export default router;
