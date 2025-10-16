import { Router } from "express";
import authRoute from "@routes/auth.routes";
import accountRoute from "@routes/account.routes";
import achievementRoute from "@routes/achievement.route";
import petRoute from "@routes/pet.routes";
import postRoute from "@routes/post.routes";
import commentRoute from "@routes/comment.routes";
import historyRoute from "@routes/history.routes";
import interactionRoute from "@routes/accountPetInteraction.routes";
import pictureRoute from "@routes/picture.routes";
import AuthMiddleware from "@middleware/authMiddleware";

const router = Router();

router.use("/account", accountRoute);
router.use("/achievement", achievementRoute);
router.use("/auth", authRoute);
router.use("/pet", petRoute);
router.use("/comment", commentRoute)
router.use("/post", postRoute);
router.use("/history", historyRoute);
router.use("/picture", pictureRoute);
router.use("/interaction", AuthMiddleware, interactionRoute);

export default router;