import { Router } from "express";
import AuthMiddleware from "@middleware/authMiddleware"; 
import AuthController from "@controller/Auth.controller";

const router = Router();

const authController = new AuthController();

router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

router.put("/change-password", AuthMiddleware, authController.changePassword);

router.post("/verify-email", authController.verifyEmail);

export default router;