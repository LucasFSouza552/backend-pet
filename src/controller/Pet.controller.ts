import { NextFunction, Request, Response } from "express";

//DTO
import { CreatePetDTO, UpdatePetDTO } from "@dtos/PetDTO";

// Interfaces
import Filter from "@interfaces/Filter";
import IController from "@interfaces/IController";

// Utils
import filterConfig from "@utils/filterConfig";

// Errors
import { ThrowError } from "@errors/ThrowError";

// Services
import { petService } from "@services/index";
import BuilderDTO from "@utils/builderDTO";

export default class PetController implements IController {
    async updatePetImages(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const files = req.files as Express.Multer.File[];
            const petId = req.params.id;

            if (!petId) throw ThrowError.badRequest("ID não foi informado.");
            if (!files || files.length === 0) throw ThrowError.badRequest("Nenhum arquivo foi enviado.");

            const pet = await petService.updatePetImages(petId, files);
            res.status(200).json(pet);
        } catch (error) {
            next(error);
        }
    }

    async deletePetImage(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const petId = req.params.id;
            const imageId = req.params.imageId;

            if (!petId) throw ThrowError.badRequest("ID não foi informado.");
            if (!imageId) throw ThrowError.badRequest("ID da imagem nao foi informado.");

            await petService.deletePetImage(petId, imageId);
            res.status(204).json();
        } catch (error) {
            next(error);
        }
    }

    async donate(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const amount = req.body?.amount;
            const accountId = req?.account?.id;

            if (!amount) throw ThrowError.badRequest("Quantidade não foi informada.");
            if (!accountId) throw ThrowError.badRequest("Conta não foi informada.");

            const pet = await petService.donate(amount, accountId);
            res.status(200).json(pet);
        } catch (error) {
            next(error);
        }
    }

    async sponsor(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id;
            const amount = req.body?.amount;
            const accountId = req?.account?.id;

            if (!id) throw ThrowError.badRequest("ID não foi informado.");
            if (!amount) throw ThrowError.badRequest("Quantidade não foi informada.");
            if (!accountId) throw ThrowError.badRequest("Conta não foi informada.");

            const pet = await petService.sponsor(id, amount, accountId);
            res.status(200).json(pet);
        } catch (error) {
            next(error);
        }
    }
    async requestAdoption(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const petId = req.params?.id;
            const accountId = req.account?.id;

            if (!petId) throw ThrowError.badRequest("ID não foi informado.");
            if (!accountId) throw ThrowError.badRequest("Conta não foi informada.");

            const history = await petService.requestAdoption(petId, accountId);
            res.status(200).json(history);
        } catch (error) {
            next(error);
        }
    }

    async rejectAdoption(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const petId = req.params?.id;
            const accountId = req.account?.id;

            if (!petId) throw ThrowError.badRequest("ID não foi informado.");
            if (!accountId) throw ThrowError.badRequest("Conta não foi informada.");

            await petService.rejectAdoption(petId, accountId);
            res.status(201).json();
        } catch (error) {
            next(error);
        }
    }

    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const allowedQueryFields: string[] = ["name", "type", "age", "gender", "adopted", "account"];
            const filters: Filter = filterConfig(req.query, allowedQueryFields);

            const pets = await petService.getAll(filters);
            res.status(200).json(pets);
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id;
            if (!id) throw ThrowError.badRequest("ID não foi informado.");
            const pet = await petService.getById(id);
            res.status(200).json(pet);
        } catch (error) {
            next(error);
        }
    }

    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const accountId = req?.account?.id;
            if (!accountId) throw ThrowError.badRequest("Conta não foi informada.");
            if (!req.account?.role || req.account?.role === "user") throw ThrowError.forbidden("Apenas instituições podem criar pets.");

            req.body.account = accountId;

            const newPetDTO: CreatePetDTO = new BuilderDTO<CreatePetDTO>(req.body)
                .add({ key: "account" })
                .add({ key: "type" })
                .add({ key: "name" })
                .add({ key: "age", type: "number" })
                .add({ key: "gender", enum: ["male", "female"] })
                .add({ key: "description", required: false })
                .build();

            const pet = await petService.create(newPetDTO);
            res.status(201).json(pet);
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id;
            if (!id) {
                throw ThrowError.badRequest("ID não foi informado.");
            }
            const pet = await petService.update(id, req.body);
            res.status(200).json(pet);
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id;
            if (!id) {
                throw ThrowError.badRequest("ID não foi informado.");
            }
            await petService.delete(id);
            res.status(204).json();
        } catch (error) {
            next(error);
        }
    }
    async getAvailable(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const filters: Filter = filterConfig({ adopted: false }, ["adopted"]);
            const pets = await petService.getAll(filters);
            res.status(200).json(pets);
        } catch (error) {
            next(error);
        }
    }

    async paymentReturn(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const paymentId = req.body.id;
            const status = req.body.status;
            const externalReference = req.body.externalReference;

            if (!paymentId) throw ThrowError.badRequest("ID do pagamento não foi informado.");
            if (!status || !["completed", "cancelled", "refunded"].includes(status)) throw ThrowError.badRequest("Status do pagamento inválido.");
            if (!externalReference) throw ThrowError.badRequest("External reference não foi informado.");

            const payment = await petService.paymentReturn(paymentId, status as "completed" | "cancelled" | "refunded", externalReference);
            res.status(200).json(payment);
        } catch (error) {
            next(error);
        }
    }
}
