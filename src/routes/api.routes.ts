import { Router } from "express";
import authRoute from "./auth.routes";
import accountRoute from "./account.routes";
import achievementRoute from "./achievement.route";
import petRoute from "./pet.routes";
import postRoute from "./post.routes";

const router = Router();

router.use("/account", accountRoute);
router.use("/achievement", achievementRoute);
router.use("/auth", authRoute);
router.use("/pet", petRoute);
router.use("/post", postRoute);

export default router;