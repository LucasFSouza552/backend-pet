import { Router } from "express";

const router = Router();

import AchievementController from "../controller/Achievement.controller";
const achievementController = new AchievementController();

router.get("/", achievementController.getAll);
router.get("/:id", achievementController.getById);
router.post("/", achievementController.create);
router.patch("/:id", achievementController.update);
router.delete("/:id", achievementController.delete);

export default router;