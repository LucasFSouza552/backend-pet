import { UpdateInstitutionDTO } from "../dtos/InstitutionDTO";
import { ThrowError } from "../errors/ThrowError";
import Filter from "../interfaces/Filter";
import IService from "../interfaces/IService";
import { IInstitution } from "../models/Institution";
import InstitutionRepository from "../repositories/Institution.repository";

const institutionRepository = new InstitutionRepository();

export class InstitutionService implements IService<IInstitution> {
    async getAll(filter: Filter): Promise<IInstitution[]> {
        try {
            return institutionRepository.getAll(filter);
        } catch (error: any) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Unable to list institutions.");
        }
    }
    async getById(id: string): Promise<IInstitution> {
        try {
            return await institutionRepository.getById(id);
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Unable to get institution.");
        }
    }
    async create(data: IInstitution): Promise<IInstitution> {
        try {
            const byCnpj = await institutionRepository.getByCnpj(data.cnpj);
            if (byCnpj) throw ThrowError.conflict("CNPJ already registered.");

            const byEmail = await institutionRepository.getByEmail(data.email);
            if (byEmail) throw ThrowError.conflict("Email already registered.");

            return await institutionRepository.create(data);
        } catch (error: any) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Unable to create institution.");
        }
    }
    async update(id: string, data: UpdateInstitutionDTO): Promise<IInstitution> {
        try {
            return await institutionRepository.update(id, data);
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Unable to update institution.");
        }
    }
    async delete(id: string): Promise<void> {
        try {
            await institutionRepository.delete(id);
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Unable to delete institution.");
        }
    }

    async getByCnpj(cnpj: string): Promise<IInstitution | null> {
        try {
            return await institutionRepository.getByCnpj(cnpj);
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Unable to fetch institution.");
        }
    }

    async getByEmail(email: string): Promise<IInstitution | null> {
        try {
            return await institutionRepository.getByEmail(email);
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Unable to fetch institution.");
        }
    }

}
