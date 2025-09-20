import { Router } from "express";
import authRoute from "./auth.routes";
import accountRoute from "./account.routes";

const router = Router();

router.use("/account", accountRoute);
router.use("/auth", authRoute);

export default router;