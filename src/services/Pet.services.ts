import { CreatePetDTO } from "./../dtos/PetDTO";
import { UpdatePetDTO } from "../dtos/PetDTO";
import { ThrowError } from "../errors/ThrowError";
import Filter from "../interfaces/Filter";
import IService from "../interfaces/IService";
import IPet from "../models/Pet";
import PetRepository from "../repositories/Pet.repository";
import HistoryRepository from "../repositories/History.repository";
import { CreateHistoryDTO, HistoryDTO } from "../dtos/HistoryDTO";
import { AccountService } from "./Account.services";

const petRepository = new PetRepository();
const historyRepository = new HistoryRepository();
const accountService = new AccountService();

export class PetService implements IService<CreatePetDTO, UpdatePetDTO, IPet> {
    async sponsor(id: string, amount: number, accountId: string) {
        try {

        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Erro ao patrocinar o pet.");
        }
    }

    async requestAdoption(petId: string, accountId: string): Promise<HistoryDTO> {
        try {

            const account = await accountService.getById(accountId);
            if(!account) throw ThrowError.notFound("Usuário não encontrado.");

            const pet = await petRepository.getById(petId);
            if(!pet) throw ThrowError.notFound("Pet não encontrado.");

            if(pet.adopted) throw ThrowError.conflict("Pet já foi adotado.");

            const newHistory = {
                type: "adoption",
                pet: pet.id,
                account: account.id,
                status: "pending"
            }

            const history = await historyRepository.create(newHistory as CreateHistoryDTO);
            if(!history) throw ThrowError.internal("Erro ao solicitar adotação.");


            await petRepository.update(pet.id, { adopted: true });

            return history;

        } catch (error) {
            if(error instanceof ThrowError) throw error;
            throw ThrowError.internal("Erro ao solicitar adotação.");
        }
    }


    async getAll(filter: Filter): Promise<IPet[]> {
        try {
            return await petRepository.getAll(filter);
        } catch (error: any) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Erro ao buscar os pets.");
        }
    }

    async getById(id: string): Promise<IPet | null> {
        try {
            const pet = await petRepository.getById(id);
            if (!pet) throw ThrowError.notFound("Pet não encontrado.");
            return pet;
        } catch (error: any) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Erro ao buscar o pet.");
        }
    }

    async create(data: CreatePetDTO): Promise<IPet> {
        try {
            const pet = await petRepository.create(data);
            if (!pet) throw ThrowError.conflict("Não foi possível cadastrar o pet.");
            return pet;
        } catch (error: any) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Erro ao criar o pet.");
        }
    }

    async update(id: string, data: UpdatePetDTO): Promise<IPet | null> {
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
