import { Router } from "express";
import authRoute from "./auth.routes";
import accountRoute from "./account.routes";
import achievementRoute from "./achievement.route";
import petRoutes from "./pet.routes";

const router = Router();

router.use("/account", accountRoute);
router.use("/achievement", achievementRoute);
router.use("/auth", authRoute);
router.use("/pet", petRoutes);

export default router;