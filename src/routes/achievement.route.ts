import { Router } from "express";

const router = Router();

import AchievementController from "@controller/achievement.controller";
import AuthMiddleware from "@middleware/authMiddleware";
import authorizationMiddleware from "@middleware/authorizationMiddleware";
const achievementController = new AchievementController();

router.get("/", achievementController.getAll);
router.get("/:id", AuthMiddleware, achievementController.getById);
router.post("/", AuthMiddleware, authorizationMiddleware(["admin"]), achievementController.create);
router.patch("/:id", AuthMiddleware, authorizationMiddleware(["admin"]), achievementController.update);
router.delete("/:id", AuthMiddleware, authorizationMiddleware(["admin"]), achievementController.delete);

router.post("/:id/add/sponsor", AuthMiddleware, authorizationMiddleware(["admin"]), achievementController.addSponsorshipsAchievement);
router.post("/:id/add/donation", AuthMiddleware, authorizationMiddleware(["admin"]), achievementController.addDonationAchievement);
router.post("/:id/add/adoption", AuthMiddleware, authorizationMiddleware(["admin"]), achievementController.addAdoptionAchievement);

export default router;