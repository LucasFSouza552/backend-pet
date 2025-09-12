import { Router } from "express";
import userRoute from "./user.routes";

const router = Router();

import userRoute from "./user.routes";
import institutionRoute from "./institution.routes";

router.use("/user", userRoute);
router.use("/institution", institutionRoute);

export default router;