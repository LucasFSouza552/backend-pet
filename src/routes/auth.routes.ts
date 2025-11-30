import { Router } from "express";
import AuthMiddleware from "@middleware/authMiddleware";
import AuthController from "@controller/auth.controller";
import authorizationMiddleware from "@middleware/authorizationMiddleware";

const router = Router();

const authController = new AuthController();

router.post("/login", authController.login);
router.post("/register", authController.register);

// (Admin) Rota para enviar o email de verificação
router.post("/send-email-verification", AuthMiddleware, authorizationMiddleware(["admin"]), authController.sendEmailVerification);

// Rota para verificar o email
router.post("/verify-email", authController.verifyEmail);

// Rota para reenviar o email de verificação
router.post("/forgot-password", authController.forgotPassword);

// Rota para resetar a senha
router.post("/reset-password", authController.resetPassword);

// Rota para mudar a senha da conta
router.put("/change-password", AuthMiddleware, authController.changePassword);

// Rota para re-enviar o email de verificação
router.post("/resend-verify-email", AuthMiddleware, authController.resendVerification);

// Rota para validar se o token é válido
router.get("/validate-token", AuthMiddleware, authController.validateToken);

export default router;