import { Router } from "express";

const router = Router();

import PostController from "../controller/Post.controller";
const postController = new PostController();

router.get("/", postController.getAll);
router.get("/:id", postController.getById);
router.post("/", postController.create);
router.patch("/:id", postController.update);
router.delete("/:id", postController.delete);

export default router;