import HistoryController from "../controller/History.controller";
import { Router } from "express";

const router = Router();

const historyController = new HistoryController();

router.get("/", historyController.getAll);
router.get("/:id", historyController.getById);
router.post("/", historyController.create);
router.patch("/:id", historyController.update);
router.delete("/:id", historyController.delete);

router.get("/account", historyController.listByAccount);
router.patch("/status/:id", historyController.updateStatus);

export default router;