import { Router } from "express";

const router = Router();
import multer from "multer";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024, files: 5 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(ThrowError.badRequest('Tipo de arquivo não permitido'));
        }
    }

});

import AccountController from "../controller/Account.controller";
import AuthMiddleware from "../middleware/authMiddleware";
import authorizationMiddleware from "../middleware/authorizationMiddleware";
import PostController from "../controller/Post.controller";
import { ThrowError } from "../errors/ThrowError";
const accountController = new AccountController();
const postController = new PostController();



router.get("/search", accountController.search);
router.patch("/", AuthMiddleware, accountController.updateProfile);
router.get("/:id", AuthMiddleware, accountController.getById);
router.get("/profile/me", AuthMiddleware, accountController.getProfile);
router.put("/avatar", upload.single("avatar"), AuthMiddleware, accountController.updateAvatar);

router.get("/", accountController.getAll);
router.post("/", AuthMiddleware, authorizationMiddleware(["admin"]), accountController.create);
router.patch("/:id", AuthMiddleware, authorizationMiddleware(["admin"]), accountController.update);
router.delete("/:id", AuthMiddleware, authorizationMiddleware(["admin"]), accountController.delete);

router.get("/profile/posts", AuthMiddleware, postController.getPostsByAccount);
router.get("/:id/status", AuthMiddleware, accountController.getStatusByAccount);



export default router;