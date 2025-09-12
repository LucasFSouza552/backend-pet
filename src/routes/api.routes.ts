import { Router } from "express";
import userRoute from "./user.routes";

const router = Router();

// Rotas
router.use("/user", userRoute);


export default router;