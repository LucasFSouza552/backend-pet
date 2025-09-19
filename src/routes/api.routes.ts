import { Router } from "express";
import accountRoute from "./account.routes";

const router = Router();

router.use("/account", accountRoute);

export default router;