import upload from "@config/multer.config";
import { notificationController } from "@controller/index";
import AuthMiddleware from "@middleware/authMiddleware";
import { Request, Response, NextFunction, Router } from "express";

const router = Router();

// Criou a notificação
router.post("/", AuthMiddleware, upload.single("image"), notificationController.create);

// Visualizar todas as notificação
router.get("/", notificationController.getAll);

export default router;