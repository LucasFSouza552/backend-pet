import { NextFunction, Request, Response } from "express";

//DTO
import { CreatePetDTO, UpdatePetDTO } from "@dtos/petDTO";

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
    async getAdoptionsByAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const accountId = req.params.id as string;
            if (!accountId) throw ThrowError.unauthorized("Usuário não autenticado.");

            const pets = await petService.getAdoptionsByAccount(accountId);

            res.status(200).json(pets);
        } catch (error) {
            next(error);
        }
    }

    async softDelete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id;
            const accountId = req.account?.id as string;

            if (!accountId) throw ThrowError.unauthorized("Usuário não autenticado.");
            if (!id) throw ThrowError.badRequest("ID não foi informado.");

            await petService.softDelete(id, accountId);
            res.status(200).json();

        } catch (error) {
            next(error);
        }
    }
    async getAllByInstitution(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const institutionId = req.params.id;
            if (!institutionId) throw ThrowError.badRequest("ID não foi informado.");

            const allowedQueryFields: string[] = ["account"];
            const filters: Filter = filterConfig({ ...req.query, account: institutionId }, allowedQueryFields);

            const pets = await petService.getAllByInstitution(filters);

            res.status(200).json(pets);
        } catch (error) {
            next(error);
        }
    }
    async updatePetImages(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const files = req.files as Express.Multer.File[];
            const petId = req.params.id;

            if (!petId) throw ThrowError.badRequest("ID não foi informado.");
            if (!files) throw ThrowError.badRequest("Nenhum arquivo foi enviado.");

            const pet = await petService.updatePetImages(petId, files);
            res.status(200).json(pet);
        } catch (error) {
            next(error);
        }
    }

    async deletePetImage(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const accountId = req.account?.id as string;
            const petId = req.params.id;
            const imageId = req.body.imageId;

            if (!accountId) throw ThrowError.badRequest("Conta não foi informada.");
            if (!petId) throw ThrowError.badRequest("ID não foi informado.");
            if (!imageId) throw ThrowError.badRequest("ID da imagem nao foi informado.");

            await petService.deletePetImage(petId, imageId, accountId);
            res.status(204).json();
        } catch (error) {
            next(error);
        }
    }


    async likePet(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const petId = req.params?.id;
            const accountId = req.account?.id;

            console.log(petId, accountId);

            if (!petId) throw ThrowError.badRequest("ID não foi informado.");
            if (!accountId) throw ThrowError.badRequest("Conta não foi informada.");

            const history = await petService.likePet(petId, accountId);
            console.log(history);
            res.status(200).json(history);
        } catch (error) {
            next(error);
        }
    }
    async dislikePet(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const petId = req.params?.id;
            const accountId = req.account?.id;
            if (!petId) throw ThrowError.badRequest("ID não foi informado.");
            if (!accountId) throw ThrowError.badRequest("Conta não foi informada.");
            const interaction = await petService.dislikePet(petId, accountId);
            res.status(200).json(interaction);
        } catch (error) {
            next(error);
        }
    }

    async requestedAdoption(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const institutionId = req.params?.id;
            const accountId = req.account?.id;

            if (!institutionId) throw ThrowError.badRequest("ID não foi informado.");
            if (!accountId) throw ThrowError.badRequest("Conta não foi informada.");

            const history = await petService.requestedAdoption(institutionId);

            res.status(200).json(history);
        } catch (error) {
            next(error);
        }
    }

    async acceptRequestedAdoption(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const petId = req.params?.id;
            const accountId = req.body.account;
            const institutionId = req.account?.id;

            if (!petId) throw ThrowError.badRequest("ID não foi informado.");
            if (!accountId) throw ThrowError.badRequest("Conta não foi informada.");
            if (!institutionId) throw ThrowError.badRequest("Instituição não foi informada.");

            await petService.acceptRequestedAdoption(petId, accountId, institutionId);
            res.status(201).json();
        } catch (error) {
            next(error);
        }
    }

    async rejectRequestedAdoption(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const petId = req.params?.id;
            const accountId = req.body.account;
            const institutionId = req.account?.id;

            if (!petId) throw ThrowError.badRequest("ID não foi informado.");
            if (!accountId) throw ThrowError.badRequest("Conta não foi informada.");
            if (!institutionId) throw ThrowError.badRequest("Instituição não foi informada.");

            await petService.rejectRequestedAdoption(petId, accountId, institutionId);
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
                .add({ key: "weight", type: "number" })
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

    
    async updatePet(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id;
            const accountId = req.account?.id;
            if (!id) throw ThrowError.badRequest("ID não foi informado.");
            if (!accountId) throw ThrowError.badRequest("Conta não foi informada.");
            const pet = await petService.updatePet(id, req.body, accountId);
            res.status(200).json(pet);
        } catch (error) {
            next(error);
        }
    }
}
