import { Router } from "express";

const router = Router();

import { CommentController } from "../controller/Comment.controller";
import AuthMiddleware from "../middleware/authMiddleware";
const commentController = new CommentController();

router.get("/", AuthMiddleware, commentController.getAll);
router.get("/:id", AuthMiddleware, commentController.getById);
router.post("/", AuthMiddleware, commentController.create);
router.patch("/:id", AuthMiddleware, commentController.update);
router.delete("/:id", AuthMiddleware, commentController.delete);