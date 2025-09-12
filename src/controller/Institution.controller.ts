import { Request, Response, NextFunction } from "express";
import IController from "../interfaces/IController";
import { ThrowError } from "../errors/ThrowError";
import { InstitutionService } from "../services/Institution.services";
import Filter from "../interfaces/Filter";
import filterConfig from "../utils/filterConfig";
import { UpdateInstitutionDTO, InstitutionDTO } from "../dtos/InstitutionDTO";
import BuilderDTO from "../utils/builderDTO";
import { IInstitution } from "../models/Institution";

const institutionService = new InstitutionService();

export default class InstitutionController implements IController {

    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {

            const allowedQueryFields: string[] = ["name", "cnpj", "email", "phone", "addressId"];
            const filters: Filter = filterConfig(req.query, allowedQueryFields);

            const institutions = await institutionService.getAll(filters);
            res.status(200).json(institutions);
            return;
        } catch (error: any) {
            next(error);
        }
    }
    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id;
            if (!id) {
                throw ThrowError.badRequest("ID was not provided.");
            }
            const institution = await institutionService.getById(id);
            res.status(200).json(institution);
        } catch (error) {
            next(error);
        }
    }
    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const newInstitutionDTO = new BuilderDTO<IInstitution>(req.body)
                .add("name")
                .add("cnpj")
                .add("email")
                .add("phone")
                .add("address.street")
                .add("address.number", "number")
                .add("address.complement")
                .add("address.city")
                .add("address.cep")
                .add("address.state")
                .build();

            if (!newInstitutionDTO.name || !newInstitutionDTO.cnpj || !newInstitutionDTO.email) {
                throw ThrowError.badRequest("Institution name, CNPJ and email are required.");
            }

            const newInstitution: InstitutionDTO = await institutionService.create(req.body);

            res.status(201).json(newInstitution);
        } catch (error: any) {
            next(error);
        }
    }
    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id;
            if (!id) {
                throw ThrowError.badRequest("ID was not provided.");
            }

            const updateData: UpdateInstitutionDTO = new BuilderDTO<IInstitution>(req.body)
                .add("name")
                .add("email")
                .add("phone")
                .add("address.street")
                .add("address.number", "number")
                .add("address.complement")
                .add("address.city")
                .add("address.cep")
                .add("address.state")
                .build();

            const institution = await institutionService.update(id, updateData);
            res.status(200).json(institution);
        } catch (error) {
            next(error);
        }
    }
    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id;
            if (!id) {
                throw ThrowError.badRequest("ID was not provided.");
            }
            await institutionService.delete(id);
            res.status(204).json();
        } catch (error) {
            next(error);
        }
    }

}
