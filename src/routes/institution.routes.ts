import { Router } from "express";

const router = Router();

import InstitutionController from "../controller/Institution.controller";
const institutionController = new InstitutionController();

router.get("/", institutionController.getAll);
router.get("/:id", institutionController.getById);
router.post("/", institutionController.create);
router.patch("/:id", institutionController.update);
router.delete("/:id", institutionController.delete);

export default router;