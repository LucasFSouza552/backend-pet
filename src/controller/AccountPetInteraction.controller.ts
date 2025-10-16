import { ThrowError } from "@errors/ThrowError";
import { NextFunction, Request, Response } from "express";
import AccountPetInteractionService from "@services/AccountPetInteraction.services";
import { createPetInteractionDTO } from "@dtos/AccountPetInteractionDTO";
import BuilderDTO from "@utils/builderDTO";

const accountPetInteractionService = new AccountPetInteractionService();
export default class AccountPetInteractionController {
    async createInteraction(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const PetInteraction = req?.body;

            PetInteraction.account = req.account?.id;
            PetInteraction.pet = req.params.id;

            console.log("PetInteraction", PetInteraction);


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
            const PetInteraction = req?.body;
            PetInteraction.status = "viewed";
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
}