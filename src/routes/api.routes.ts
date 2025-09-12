import { Router } from "express";

const router = Router();

import userRoute from "./user.routes";
import institutionRoute from "./institution.routes";

router.use("/user", userRoute);
router.use("/institution", institutionRoute);

export default router;