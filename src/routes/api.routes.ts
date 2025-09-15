import { Router } from "express";
import accountRoute from "./Account.routes";

const router = Router();


router.use("/account", accountRoute);

export default router;