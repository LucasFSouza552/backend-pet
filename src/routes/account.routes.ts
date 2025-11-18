import { Router } from "express";
import AccountController from "@controller/account.controller";
import AuthMiddleware from "@middleware/authMiddleware";
import authorizationMiddleware from "@middleware/authorizationMiddleware";
import PostController from "@controller/post.controller";
import HistoryController from "@controller/history.controller";
import upload from "@config/multer.config";

const router = Router();

const accountController = new AccountController();
const postController = new PostController();
const historyController = new HistoryController();

// Rota para retornar o feed dos pets de uma conta
router.get("/feed", AuthMiddleware, accountController.getFeed);

// Rota para pesquisar contas
router.get("/search", accountController.search);

// Rota para atualizar conta
router.patch("/", AuthMiddleware, accountController.updateProfile);

// Rota para retornar uma conta específica
router.get("/:id", AuthMiddleware, accountController.getById);

// Rota para retornar a conta do usuário logado
router.get("/profile/me", AuthMiddleware, accountController.getProfile);

// Rota para atualizar avatar
router.put("/avatar", upload.single("avatar"), AuthMiddleware, accountController.updateAvatar);

// (ADMIN) Rota para retornar todas as contas
router.get("/", AuthMiddleware, authorizationMiddleware(["admin"]), accountController.getAll);

// (ADMIN) Rota para criar uma conta
router.post("/", AuthMiddleware, authorizationMiddleware(["admin"]), accountController.create);

// (ADMIN) Rota para atualizar uma conta
router.patch("/:id", AuthMiddleware, authorizationMiddleware(["admin"]), accountController.update);

// (ADMIN) Rota para deletar uma conta
router.delete("/:id", AuthMiddleware, authorizationMiddleware(["admin"]), accountController.delete);
    
// Rota para retornar os posts de uma conta
router.get("/profile/posts", AuthMiddleware, postController.getPostsByAccount);

// Rota para retornar o status de uma conta
router.get("/:id/status", AuthMiddleware, accountController.getStatusByAccount);

// Rota para doar para o aplicativo (doação geral, não vinculada a um pet)
router.post("/donate", AuthMiddleware, authorizationMiddleware(["user", "admin"]), historyController.donate);

// Rota para apadrinhar/patrocinar uma instituição
router.post("/sponsor/:id", AuthMiddleware, authorizationMiddleware(["user", "admin"]), historyController.sponsor);

export default router;