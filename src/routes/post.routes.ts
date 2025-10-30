import { Router } from "express";
import PostController from "@controller/Post.controller";
import AuthMiddleware from "@middleware/authMiddleware";
import upload from "@config/multer.config";
import authorizationMiddleware from "@middleware/authorizationMiddleware";

const router = Router();

const postController = new PostController();

router.delete("/:id", AuthMiddleware, authorizationMiddleware(["admin"]), postController.delete);

router.get("/search", postController.search);
router.get("/", postController.getAll);
router.get("/:id", postController.getById);
router.post("/", AuthMiddleware, upload.array("images"), postController.create);

// SoftDelete do post
router.post("/:id/delete", AuthMiddleware, postController.softDelete);

router.patch("/:id", AuthMiddleware, postController.update);
router.get("/posts/with-author", postController.getPostsWithAuthor);
router.post("/:id/like", AuthMiddleware, postController.toggleLike);

export default router;