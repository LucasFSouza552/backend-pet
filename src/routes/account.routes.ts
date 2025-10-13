import { Router } from "express";
import AccountController from "../controller/Account.controller";
import AuthMiddleware from "../middleware/authMiddleware";
import authorizationMiddleware from "../middleware/authorizationMiddleware";
import PostController from "../controller/Post.controller";
import upload from "../config/multer.config";

const router = Router();

const accountController = new AccountController();
const postController = new PostController();

router.get("/search", accountController.search);
router.patch("/", AuthMiddleware, accountController.updateProfile);
router.get("/:id", AuthMiddleware, accountController.getById);
router.get("/profile/me", AuthMiddleware, accountController.getProfile);
router.put("/avatar", upload.single("avatar"), AuthMiddleware, accountController.updateAvatar);

router.get("/", accountController.getAll);
router.post("/", AuthMiddleware, authorizationMiddleware(["admin"]), accountController.create);
router.patch("/:id", AuthMiddleware, authorizationMiddleware(["admin"]), accountController.update);
router.delete("/:id", AuthMiddleware, authorizationMiddleware(["admin"]), accountController.delete);

router.get("/profile/posts", AuthMiddleware, postController.getPostsByAccount);
router.get("/:id/status", AuthMiddleware, accountController.getStatusByAccount);

export default router;