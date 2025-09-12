import { FilterQuery } from "mongoose";
import Filter from "../interfaces/Filter";
import IRepository from "../interfaces/IRepository";
import { IInstitution, Institution } from "../models/Institution";
import { ThrowError } from "../errors/ThrowError";
import { UpdateInstitutionDTO } from "../dtos/InstitutionDTO";

export default class InstitutionRepository implements IRepository<IInstitution> {
    async getAll(filter: Filter): Promise<IInstitution[]> {
        try {
            const { page, limit, orderBy, order, query } = filter;

            return await Institution.find(query as FilterQuery<IInstitution>)
                .sort({ [orderBy]: order })
                .skip((page - 1) * limit)
                .limit(limit);

        } catch (error: any) {
            throw ThrowError.internal("Error fetching institutions.");
        }
    }
    async getById(id: string): Promise<IInstitution> {
        try {
            const institution = await Institution.findById(id);
            if (!institution) {
                throw ThrowError.notFound("Institution not found.");
            }
            return institution;
        } catch (error) {
            throw ThrowError.internal("Error fetching institution.");
        }
    }
    async create(data: IInstitution): Promise<IInstitution> {
        try {
            const institution = await Institution.create(data);
            return institution;
        } catch (error: any) {
            if (error.name === "ValidationError") {
                throw ThrowError.badRequest("Invalid data: " + error.message);
            }

            if (error.code === 11000) {
                throw ThrowError.conflict("CNPJ or Email already in use.");
            }

            throw ThrowError.internal("Error creating institution.");
        }
    }
    async update(id: string, data: UpdateInstitutionDTO): Promise<IInstitution> {
        try {
            const institution = await Institution.findById(id);
            if (!institution) {
                throw ThrowError.notFound("Institution not found.");
            }
            const updatedInstitution = await Institution.findByIdAndUpdate(id, data, {
                new: true,
                runValidators: true
            });
            if (!updatedInstitution) {
                throw ThrowError.internal("Error updating institution.");
            }
            return updatedInstitution as IInstitution;
        } catch (error: any) {

            if (error.name === "CastError") {
                throw ThrowError.badRequest("Invalid ID.");
            }

            if (error.name === "ValidationError") {
                throw ThrowError.badRequest("Invalid data: " + error.message);
            }

            if (error.code === 11000) {
                throw ThrowError.conflict("CNPJ or Email already in use.");
            }
            throw ThrowError.internal("Error updating institution.");
        }
    }
    async delete(id: string): Promise<void> {
        try {
            const institution = await Institution.findByIdAndDelete(id);
            if (!institution) {
                throw ThrowError.notFound("Institution not found.");
            }
        } catch (error) {
            throw ThrowError.internal("Error deleting institution.");
        }
    }

    async getByCnpj(cnpj: string): Promise<IInstitution | null> {
        try {
            return await Institution.findOne({ cnpj });
        } catch (error) {
            throw ThrowError.internal("Error fetching institution by CNPJ.");
        }
    }

    async getByEmail(email: string): Promise<IInstitution | null> {
        try {
            return await Institution.findOne({ email });
        } catch (error) {
            throw ThrowError.internal("Error fetching institution by email.");
        }
    }

};
