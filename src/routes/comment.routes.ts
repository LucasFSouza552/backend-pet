import { Router } from "express";
import AuthMiddleware from "@middleware/authMiddleware";
import authorizationMiddleware from "@middleware/authorizationMiddleware";
import { commentController } from "@controller/index";

const router = Router();

router.get("/", AuthMiddleware, authorizationMiddleware(["admin"]), commentController.getAll);
router.delete("/:id", AuthMiddleware, authorizationMiddleware(["admin"]), commentController.delete);

// Rota para retornar todos os comentários de um post
router.get("/post/:id", commentController.getAllByPost);

// Rota para retornar um comentário pelo id
router.get("/:id", commentController.getById);

// Rota para responder um comentário
router.post("/:id/reply", AuthMiddleware, commentController.reply);

// Rota para criar um comentário
router.post("/:id", AuthMiddleware, commentController.create);

// Rota para atualizar um comentário
router.patch("/:id", AuthMiddleware, commentController.update);

// Rota para ocultar/apagar um comentário
router.patch("/own/:id", AuthMiddleware, commentController.deleteOwnComment);

// Rota para retornar todas as respostas de um comentário
router.get("/:id/replies", commentController.getReplies);

export default router;