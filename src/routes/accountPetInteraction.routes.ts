import { Router } from "express";
import AccountPetInteractionController from "../controller/AccountPetInteraction.controller";

const router = Router();

const accountPetInteractionController = new AccountPetInteractionController();

router.get("/", accountPetInteractionController.getInteractions);
router.get("/:id", accountPetInteractionController.getPetInteractions);
router.post("/", accountPetInteractionController.createInteraction);
router.patch("/", accountPetInteractionController.updateInteractionStatus);
router.patch("/:id", accountPetInteractionController.undoInteraction);

export default router;