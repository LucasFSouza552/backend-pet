import PetController from "@controller/Pet.controller";
import AuthMiddleware from "@middleware/authMiddleware";
import authorizationMiddleware from "@middleware/authorizationMiddleware";
import upload from "@config/multer.config";
import { Router } from "express";

const router = Router();

const petController = new PetController();

// (ADMIN | INSTITUTION) Retonar todos os pets
router.get("/", AuthMiddleware, authorizationMiddleware(["institution", "admin"]), petController.getAll);

// (ADMIN | INSTITUTION) Rota para criar um pet
router.post("/", AuthMiddleware, authorizationMiddleware(["institution", "admin"]), petController.create);

// (ADMIN) Rota para atualizar um pet
router.patch("/:id", AuthMiddleware, authorizationMiddleware(["admin"]), petController.update);

// (ADMIN) Rota para deletar um pet
router.delete("/:id", AuthMiddleware, authorizationMiddleware(["admin"]), petController.delete);

// Rota para retornar todos os pets disponíveis
router.get("/avaliable", AuthMiddleware, petController.getAvailable);

// Rota para retornar um pet pelo id
router.get("/:id", AuthMiddleware, petController.getById);

// Rota para solicitar uma adoção
router.post("/:id/adopt", AuthMiddleware, petController.requestAdoption);

// Rota para rejeitar uma adoção
router.post("/:id/reject", AuthMiddleware, petController.rejectAdoption);

// Rota para apadrinhar um pet
router.post("/:id/sponsor", AuthMiddleware, petController.sponsor);

// Rota para doar para o aplicativo
router.post("/:id/donate", AuthMiddleware, petController.donate);

// Rota para atualizar a imagem de um pet
router.post("/:id/avatar", AuthMiddleware, authorizationMiddleware(["institution", "admin"]), upload.array("avatar", 6), petController.updatePetImages);

// Rota para deletar uma imagem de um pet
router.delete("/:id/avatar/:imageId", AuthMiddleware, authorizationMiddleware(["institution"]), petController.deletePetImage);

// Rota para retorno de pagamento
router.post("/payment-return", petController.paymentReturn);

export default router;