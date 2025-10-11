import { Router } from "express";

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

import PostController from "../controller/Post.controller";
import AuthMiddleware from "../middleware/authMiddleware";
import multer from "multer";
const postController = new PostController();

router.get("/", AuthMiddleware, postController.getAll);
router.get("/:id", AuthMiddleware, postController.getById);
router.post("/", AuthMiddleware, upload.array("images"), postController.create);
router.patch("/:id", AuthMiddleware, postController.update);
router.delete("/:id", AuthMiddleware, postController.delete);

router.get("/posts/with-author", AuthMiddleware, postController.getPostsWithAuthor);

router.post("/:id/like", AuthMiddleware, postController.toggleLike);

export default router;