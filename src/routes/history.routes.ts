import HistoryController from "../controller/History.controller";
import { Router } from "express";
import AuthMiddleware from "../middleware/authMiddleware";
import authorizationMiddleware from "../middleware/authorizationMiddleware";

const router = Router();

const historyController = new HistoryController();

router.get("/", historyController.getAll);
router.get("/:id", historyController.getById);
router.post("/", historyController.create);
router.patch("/:id", historyController.update);
router.delete("/:id", historyController.delete);

router.get("/account", historyController.listByAccount);


router.patch("/status/:id", historyController.updateStatus);
router.patch("/status/:id/approve", AuthMiddleware, authorizationMiddleware(["institution"]), historyController.updateHistoryStatus);

export default router;