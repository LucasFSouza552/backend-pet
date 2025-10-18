import { Router } from "express";
import AccountController from "@controller/Account.controller";
import AuthMiddleware from "@middleware/authMiddleware";
import authorizationMiddleware from "@middleware/authorizationMiddleware";
import PostController from "@controller/Post.controller";
import upload from "@config/multer.config";

const router = Router();

const accountController = new AccountController();
const postController = new PostController();

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


export default router;