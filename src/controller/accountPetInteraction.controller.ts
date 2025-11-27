import { NextFunction, Request, Response } from "express";

// Erros
import { ThrowError } from "@errors/ThrowError";

// DTOS
import { createPetInteractionDTO, updatePetInteractionDTO } from "@dtos/accountPetInteractionDTO";

// Utils
import BuilderDTO from "@utils/builderDTO";

// Services
import { accountPetInteractionService, petService } from "@services/index";

// Mappers
import petMapper from "@Mappers/petMapper";

export default class AccountPetInteractionController {
    async createInteraction(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const PetInteraction = req?.body;

            PetInteraction.account = req.account?.id;
            PetInteraction.pet = req.params.id;

            const newPetDTO: createPetInteractionDTO = new BuilderDTO<createPetInteractionDTO>(PetInteraction)
                .add({ key: "account" })
                .add({ key: "pet" })
                .add({ key: "status" })
                .build();

            await accountPetInteractionService.create(newPetDTO);
            res.status(201).json();
        } catch (error) {
            next(error);
        }
    }

    async updateInteractionStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const PetInteraction = req?.body;
            PetInteraction.account = req.account?.id;
            PetInteraction.pet = req.params.id;
            const updatePetDTO: createPetInteractionDTO = new BuilderDTO<createPetInteractionDTO>(PetInteraction)
                .add({ key: "account" })
                .add({ key: "pet" })
                .add({ key: "status" })
                .build();

            const interaction = await accountPetInteractionService.updateStatus(updatePetDTO);
            res.status(200).json(interaction);
        } catch (error) {
            next(error);
        }
    }

    async undoInteraction(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const accountId = req.account?.id as string;
            const petId = req.params.id as string;

            if (!petId) throw ThrowError.badRequest("Pet não foi informado.");
            if (!accountId) throw ThrowError.badRequest("Conta não foi informada.");

            const PetInteraction: createPetInteractionDTO = { pet: petId, status: "viewed", account: accountId } as createPetInteractionDTO;

            const updatePetDTO: createPetInteractionDTO = new BuilderDTO<createPetInteractionDTO>(PetInteraction as any)
                .add({ key: "account" })
                .add({ key: "pet" })
                .add({ key: "status" })
                .build();

            await accountPetInteractionService.updateStatus(updatePetDTO);

            const pet = await petService.getById(petId);
            if (!pet) throw ThrowError.notFound("Pet não encontrado.");

            const petDTO = petMapper(pet);
            res.status(200).json(petDTO);
        } catch (error) {
            next(error);
        }
    }

    async getPetInteractions(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const petId = req.params?.id as string;
            if (!petId) throw ThrowError.badRequest("Pet não foi informado.");

            const interactions = await accountPetInteractionService.getPetInteraction(petId);
            res.status(200).json(interactions);
        } catch (error) {
            next(error);
        }
    }

    async getInteractions(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const accountId = req.account?.id as string;
            if (!accountId) throw ThrowError.badRequest("Conta não foi informada.");
            const interactions = await accountPetInteractionService.getByAccount(accountId);
            res.status(200).json(interactions);
        } catch (error) {
            next(error);
        }
    }

    async getInteractionByAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const accountId = req.params.id as string;
            if (!accountId) throw ThrowError.badRequest("Conta não foi informada.");
            const interactions = await accountPetInteractionService.getByAccount(accountId);
            res.status(200).json(interactions);
        } catch (error) {
            next(error);
        }
    }
}