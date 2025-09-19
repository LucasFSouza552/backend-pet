import { Router } from "express";

const router = Router();

import AccountController from "../controller/Account.controller";
const accountController = new AccountController();

router.get("/", accountController.getAll);
router.get("/:id", accountController.getById);
router.post("/", accountController.create);
router.patch("/:id", accountController.update);
router.delete("/:id", accountController.delete);

// Endpoints for authentication (Login)

router.post("/login", accountController.login)

export default router;