import { historyController } from "@controller/index";
import { Router } from "express";

const router = Router();

router.post("/", historyController.paymentReturn);

export default router;