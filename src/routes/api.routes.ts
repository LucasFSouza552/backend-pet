import { Router } from "express";
import authRoute from "./auth.routes";
import accountRoute from "./account.routes";
import achievementRoute from "./achievement.route";
import petRoute from "./pet.routes";
import postRoute from "./post.routes";
import commentRoute from "./comment.routes";
import historyRoute from "./history.routes";
import pictureRoute from "./picture.routes";
import interactionRoute from "./accountPetInteraction.routes";
import AuthMiddleware from "../middleware/authMiddleware";

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