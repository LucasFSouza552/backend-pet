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

router.patch("/", AuthMiddleware, accountController.updateProfile);
router.get("/:id", AuthMiddleware, accountController.getById);
router.get("/profile/me", AuthMiddleware, accountController.getProfile);
router.put("/avatar", upload.single("avatar"), AuthMiddleware, accountController.updateAvatar);

router.get("/", accountController.getAll);
router.post("/", AuthMiddleware, authorizationMiddleware(["admin"]), accountController.create);
router.patch("/:id", AuthMiddleware, authorizationMiddleware(["admin"]), accountController.update);
router.delete("/:id", AuthMiddleware, authorizationMiddleware(["admin"]), accountController.delete);

export default router;