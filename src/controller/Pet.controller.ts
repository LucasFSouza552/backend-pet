import { NextFunction, Request, Response } from "express";
import { PetService } from "../services/Pet.services";
import Filter from "../interfaces/Filter";
import filterConfig from "../utils/filterConfig";
import IController from "../interfaces/IController";
import { ThrowError } from "../errors/ThrowError";

const petService = new PetService();

export default class PetController implements IController {
    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const allowedQueryFields: string[] = ["name", "type", "age", "gender", "adopted"];
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
            if (!id) {
                throw ThrowError.badRequest("ID não foi informado.");
            }
            const pet = await petService.getById(id);
            res.status(200).json(pet);
        } catch (error) {
            next(error);
        }
    }

    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const pet = await petService.create(req.body);
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
}
