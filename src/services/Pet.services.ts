import { ThrowError } from "../errors/ThrowError";
import Filter from "../interfaces/Filter";
import IService from "../interfaces/IService";
import IPet from "../models/Pet";
import PetRepository from "../repositories/Pet.repository";

const petRepository = new PetRepository();

export class PetService implements IService<IPet> {
    async getAll(filter: Filter): Promise<IPet[]> {
        try {
            return await petRepository.getAll(filter);
        } catch (error: any) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Erro ao buscar os pets.");
        }
    }

    async getById(id: string): Promise<IPet> {
        try {
            const pet = await petRepository.getById(id);
            if (!pet) throw ThrowError.notFound("Pet não encontrado.");
            return pet;
        } catch (error: any) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Erro ao buscar o pet.");
        }
    }

    async create(data: IPet): Promise<IPet> {
        try {
            const pet = await petRepository.create(data);
            if (!pet) throw ThrowError.conflict("Não foi possível cadastrar o pet.");
            return pet;
        } catch (error: any) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Erro ao criar o pet.");
        }
    }

    async update(id: string, data: Partial<IPet>): Promise<IPet> {
        try {
            const pet = await petRepository.update(id, data);
            if (!pet) throw ThrowError.notFound("Pet não encontrado para atualização.");
            return pet;
        } catch (error: any) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Erro ao atualizar o pet.");
        }
    }

    async delete(id: string): Promise<void> {
        try {
            const pet = await petRepository.getById(id);
            if (!pet) throw ThrowError.notFound("Pet não encontrado para exclusão.");
            await petRepository.delete(id);
        } catch (error: any) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Erro ao deletar o pet.");
        }
    }
}
