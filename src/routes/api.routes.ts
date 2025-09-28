import { Router } from "express";
import authRoute from "./auth.routes";
import accountRoute from "./account.routes";
import achievementRoute from "./achievement.route";
import petRoute from "./pet.routes";
import postRoute from "./post.routes";
import commentRoute from "./comment.routes";
import HistoryRoute from "./history.routes";

const router = Router();

router.use("/account", accountRoute);
router.use("/achievement", achievementRoute);
router.use("/auth", authRoute);
router.use("/pet", petRoute);
router.use("/comment", commentRoute)
router.use("/post", postRoute);
router.use("/history", HistoryRoute);

export default router;