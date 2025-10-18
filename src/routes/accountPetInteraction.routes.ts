import { Router } from "express";
import AccountPetInteractionController from "@controller/AccountPetInteraction.controller";
import authorizationMiddleware from "@middleware/authorizationMiddleware";
import AuthMiddleware from "@middleware/authMiddleware";

const router = Router();

const accountPetInteractionController = new AccountPetInteractionController();

// Rota para retornar todas as interações
router.get("/:id", authorizationMiddleware(["admin"]), accountPetInteractionController.getPetInteractions);

// Rota para retornar todas as interações da conta
router.get("/", AuthMiddleware, accountPetInteractionController.getInteractions);

// Rota par criar uma interação
router.post("/:id", AuthMiddleware, accountPetInteractionController.createInteraction);

// Rota para atualizar uma interação
router.patch("/", AuthMiddleware, accountPetInteractionController.updateInteractionStatus);

// Rota para desfazer uma interação
router.patch("/:id", AuthMiddleware, accountPetInteractionController.undoInteraction);

export default router;