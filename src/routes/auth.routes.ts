import { Router } from "express";

const router = Router();

import AuthMiddleware from "../middleware/authMiddleware";

import AuthController from "../controller/AuthController.controller";

const authController = new AuthController();

router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

router.put("/change-password", AuthMiddleware, authController.changePassword);

router.get("/verify-email", authController.verifyEmail);

router.post("/reset-password", authController.resetPassword);

export default router;