import { Router } from "express";

const router = Router();
import multer from "multer";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 }
});

import AccountController from "../controller/Account.controller";
import AuthMiddleware from "../middleware/authMiddleware";
import authorizationMiddleware from "../middleware/authorizationMiddleware";
const accountController = new AccountController();

router.get("/", AuthMiddleware, authorizationMiddleware(["admin"]), accountController.getAll);
router.get("/:id", AuthMiddleware, accountController.getById);
router.post("/", accountController.create);
router.patch("/:id", AuthMiddleware, accountController.update);
router.delete("/:id", AuthMiddleware, accountController.delete);

router.put("/avatar", AuthMiddleware, upload.single("avatar"), accountController.updateAvatar);

export default router;