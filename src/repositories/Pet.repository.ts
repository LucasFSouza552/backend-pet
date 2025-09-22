import IPet from "../models/Pet";
import { Pet } from "../models/Pet";
import Filter from "../interfaces/Filter";
import IRepository from "../interfaces/IRepository";
import { CreatePetDTO, UpdatePetDTO } from "../dtos/PetDTO";
import { ThrowError } from "../errors/ThrowError";
import { FilterQuery } from "mongoose";

export default class PetRepository implements IRepository<CreatePetDTO, UpdatePetDTO, IPet> {
    async getAll(filter: Filter): Promise<IPet[]> {
        try {
            const { page, limit, orderBy, order, query } = filter;

            const pets = await Pet.find(query as FilterQuery<IPet>)
                .sort({ [orderBy]: order })
                .skip((page - 1) * limit)
                .limit(limit);
            return pets;
        } catch (error: any) {
            throw ThrowError.internal("Erro ao buscar os pets.");
        }
    }

    async getById(id: string): Promise<IPet> {
        try {
            const pet = await Pet.findById(id);
            if (!pet) {
                throw ThrowError.notFound("Pet não encontrado.");
            }
            return pet;
        } catch (error) {
            throw ThrowError.internal("Erro ao buscar o pet.");
        }
    }

    async create(data: CreatePetDTO): Promise<IPet> {
        try {
            const pet = new Pet(data);
            return await pet.save();
        } catch (error: any) {
            if (error.name === "ValidationError") {
                throw ThrowError.badRequest("Dados inválidos: " + error.message);
            }
            console.error(error);
            if (error.code === 11000) {
                throw ThrowError.conflict("E-mail já está em uso.");
            }

            throw ThrowError.internal("Erro ao criar usuário.");
        }
    }

    async update(id: string, data: UpdatePetDTO): Promise<IPet> {
        try {
            const pet = await Pet.findById(id);
            if (!pet) {
                throw ThrowError.notFound("Pet não encontrado para atualização.");
            }

            const updatedPet = await Pet.findByIdAndUpdate(id, data, { new: true, runValidators: true });

            if (!updatedPet) {
                throw ThrowError.internal("Erro ao atualizar o pet.");
            }
            return updatedPet;
        } catch (error) {
            throw ThrowError.internal("Erro ao atualizar o pet.");
        }
    }

    async delete(id: string): Promise<void> {
        try {
            const pet = await Pet.findByIdAndDelete(id);
            if (!pet) {
                throw ThrowError.notFound("Pet não encontrado.");
            }
        } catch (error) {
            throw ThrowError.internal("Erro ao deletar o pet.");
        }
    }
}
