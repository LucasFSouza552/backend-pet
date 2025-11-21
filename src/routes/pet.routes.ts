import PetController from "@controller/pet.controller";
import AuthMiddleware from "@middleware/authMiddleware";
import authorizationMiddleware from "@middleware/authorizationMiddleware";
import upload from "@config/multer.config";
import { Router } from "express";

const router = Router();

const petController = new PetController();

// (ADMIN) Retonar todos os pets
router.get("/", AuthMiddleware, authorizationMiddleware(["admin"]), petController.getAll);

// (INSTITUTION) rota para retornar todos os pets de uma instituição
router.get("/institutions/:id/pets", AuthMiddleware, petController.getAllByInstitution);

// (ADMIN | INSTITUTION) Rota para criar um pet
router.post("/", AuthMiddleware, authorizationMiddleware(["institution", "admin"]),  petController.create);

// (ADMIN) Rota para atualizar um pet
router.patch("/:id", AuthMiddleware, authorizationMiddleware(["admin"]), petController.update);

// (ADMIN) Rota para deletar um pet
router.delete("/:id", AuthMiddleware, authorizationMiddleware(["admin"]), petController.delete);

// Rota para retornar todos os pets disponíveis
router.get("/avaliable", AuthMiddleware, petController.getAvailable);

// Rota para retornar um pet pelo id
router.get("/:id", AuthMiddleware, petController.getById);

// Rota para solicitar uma adoção
router.post("/:id/like", AuthMiddleware, authorizationMiddleware(["user", "admin"]), petController.likePet);

// Rota para quando não quero adotar
router.post("/:id/dislike", AuthMiddleware, authorizationMiddleware(["user", "admin"]), petController.dislikePet);

// Rota para aceitar uma adoção
router.post("/:id/accept", AuthMiddleware, authorizationMiddleware(["institution", "admin"]), petController.acceptRequestedAdoption);

// Rota para rejeitar uma adoção
router.post("/:id/reject", AuthMiddleware, authorizationMiddleware(["institution", "admin"]), petController.rejectRequestedAdoption);

// Rota para atualizar a imagem de um pet
router.post("/:id/avatar", AuthMiddleware, authorizationMiddleware(["institution", "admin"]), upload.array("images", 6), petController.updatePetImages);

// Rota para deletar uma imagem de um pet
router.post("/:id/image", AuthMiddleware, authorizationMiddleware(["institution"]), petController.deletePetImage);

// Rota para retorno de pagamento
router.post("/payment-return", petController.paymentReturn);

// SoftDelete do pet
router.post("/:id/delete", AuthMiddleware,authorizationMiddleware(["institution", "admin"]), petController.softDelete);

// Rota para retornar as adições de um usuário
router.get("/adopted/:id", AuthMiddleware, petController.getAdoptionsByAccount);

// Rota para retornar os pets de uma instituição que alguem deseja adotar
router.get("/institutions/:id/pets/requested", AuthMiddleware, petController.requestedAdoption);

// Rota para instituição atualizar o pet
router.patch("/:id/update", AuthMiddleware, authorizationMiddleware(["institution", "admin"]), petController.updatePet);
export default router;