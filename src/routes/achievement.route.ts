import { Router } from "express";

const router = Router();

import AchievementController from "../controller/Achievement.controller";
import AuthMiddleware from "../middleware/authMiddleware";
import authorizationMiddleware from "../middleware/authorizationMiddleware";
const achievementController = new AchievementController();

router.get("/", achievementController.getAll);
router.get("/:id", achievementController.getById);
router.post("/", AuthMiddleware, authorizationMiddleware(["admin"]), achievementController.create);
router.patch("/:id", achievementController.update);
router.delete("/:id", AuthMiddleware, authorizationMiddleware(["admin"]), achievementController.delete);

export default router;