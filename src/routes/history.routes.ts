import HistoryController from "@controller/history.controller";
import PetController from "@controller/pet.controller";
import AuthMiddleware from "@middleware/authMiddleware";
import authorizationMiddleware from "@middleware/authorizationMiddleware";
import { Router } from "express";

const router = Router();

const historyController = new HistoryController();
const petController = new PetController();

// Rota para retornar todos os históricos
router.get("/", AuthMiddleware, authorizationMiddleware(["admin"]), historyController.getAll);
router.get("/:id", AuthMiddleware, authorizationMiddleware(["admin"]), historyController.getById);
router.post("/", AuthMiddleware, authorizationMiddleware(["admin"]), historyController.create);
router.patch("/:id", AuthMiddleware, authorizationMiddleware(["admin"]), historyController.update);
router.delete("/:id", historyController.delete);

router.get("/profile/me", AuthMiddleware, historyController.listByAccount);

router.patch("/status/:id", AuthMiddleware, authorizationMiddleware(["institution"]), historyController.updateHistoryStatus);

// Rota para retorno de pagamento
router.post("/payment-return", historyController.paymentReturn);

export default router;