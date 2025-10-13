import { Router } from "express";
import PostController from "../controller/Post.controller";
import AuthMiddleware from "../middleware/authMiddleware";
import upload from "../config/multer.config";

const router = Router();

const postController = new PostController();

router.get("/search", postController.search);
router.get("/", postController.getAll);
router.get("/:id", postController.getById);
router.post("/", AuthMiddleware, upload.array("images"), postController.create);
router.patch("/:id", AuthMiddleware, postController.update);
router.delete("/:id", AuthMiddleware, postController.delete);
router.get("/posts/with-author", AuthMiddleware, postController.getPostsWithAuthor);
router.post("/:id/like", AuthMiddleware, postController.toggleLike);

export default router;