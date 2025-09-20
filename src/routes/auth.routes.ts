import { Router } from "express";

const router = Router();

import AccountController from "../controller/Account.controller";
const accountController = new AccountController();

router.post("/login", accountController.login);

export default router;