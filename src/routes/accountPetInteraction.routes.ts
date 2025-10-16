import { Router } from "express";
import AccountPetInteractionController from "@controller/AccountPetInteraction.controller";
import authorizationMiddleware from "@middleware/authorizationMiddleware";

const router = Router();

const accountPetInteractionController = new AccountPetInteractionController();

router.get("/", accountPetInteractionController.getInteractions);
router.get("/:id", authorizationMiddleware(["admin"]), accountPetInteractionController.getPetInteractions);
router.post("/:id", accountPetInteractionController.createInteraction);
router.patch("/", accountPetInteractionController.updateInteractionStatus);
router.patch("/:id", accountPetInteractionController.undoInteraction);

export default router;