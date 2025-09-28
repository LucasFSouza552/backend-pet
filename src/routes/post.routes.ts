import { Router } from "express";

const router = Router();

import PostController from "../controller/Post.controller";
import AuthMiddleware from "../middleware/authMiddleware";
const postController = new PostController();

router.get("/", AuthMiddleware, postController.getAll);
router.get("/:id", AuthMiddleware, postController.getById);
router.post("/", AuthMiddleware, postController.create);
router.patch("/:id", AuthMiddleware, postController.update);
router.delete("/:id", AuthMiddleware, postController.delete);

router.get("/posts/full", AuthMiddleware, postController.getPostsWithAuthor);

export default router;