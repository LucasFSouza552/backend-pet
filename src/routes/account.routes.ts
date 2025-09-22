import { Router } from "express";

const router = Router();

import AccountController from "../controller/Account.controller";
import AuthMiddleware from "../middleware/authMiddleware";
import authorizationMiddleware from "../middleware/authorizationMiddleware";
const accountController = new AccountController();

router.get("/", AuthMiddleware, authorizationMiddleware(["admin"]), accountController.getAll);
router.get("/:id", AuthMiddleware, accountController.getById);
router.post("/", accountController.create);
router.patch("/:id", AuthMiddleware, accountController.update);
router.delete("/:id", AuthMiddleware, accountController.delete);

export default router;