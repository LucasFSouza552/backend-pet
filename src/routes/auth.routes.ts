import { Router } from "express";

const router = Router();

import AccountController from "../controller/Account.controller";
import AuthMiddleware from "../middleware/authMiddleware";
const accountController = new AccountController();

router.post("/login", accountController.login);
router.get("/profile", AuthMiddleware, accountController.getProfile);

export default router;