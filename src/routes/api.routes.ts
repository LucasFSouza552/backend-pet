import { Router } from "express";
import userRoute from "./user.routes";
import institutionRoute from "./institution.routes";

const router = Router();


router.use("/user", userRoute);
router.use("/institution", institutionRoute);


export default router;