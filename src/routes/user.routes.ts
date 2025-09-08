import { Router } from "express";

const router = Router();

import UserController from "../controller/User.controller";
const userController = new UserController();

router.get("/", userController.getAll);
router.get("/:id", userController.getById);
router.post("/", userController.create);
router.patch("/:id", userController.update);
router.delete("/:id", userController.delete);

export default router;