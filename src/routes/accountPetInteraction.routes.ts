import { Router } from "express";
import AccountPetInteractionController from "@controller/accountPetInteraction.controller";
import authorizationMiddleware from "@middleware/authorizationMiddleware";
import AuthMiddleware from "@middleware/authMiddleware";

const router = Router();

const accountPetInteractionController = new AccountPetInteractionController();


// Rota para retornar todas as interações da conta
router.get("/", AuthMiddleware, accountPetInteractionController.getInteractions);

// Rota para retornar todas as interações de um pet
router.get("/profile/:id", AuthMiddleware, accountPetInteractionController.getInteractionByAccount);

// Rota para retornar todas as interações
router.get("/:id", authorizationMiddleware(["admin"]), accountPetInteractionController.getPetInteractions);

// Rota par criar uma interação
router.post("/:id", AuthMiddleware, accountPetInteractionController.createInteraction);

// Rota para atualizar uma interação
router.patch("/", AuthMiddleware, accountPetInteractionController.updateInteractionStatus);

// Rota para desfazer uma interação
router.patch("/:id", AuthMiddleware, accountPetInteractionController.undoInteraction);

export default router;