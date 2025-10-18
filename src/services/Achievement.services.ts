// DTOS
import { AchievementDTO, CreateAchievementDTO, UpdateAchievementDTO } from "@dtos/AchievementDTO";

// Errors
import { ThrowError } from "@errors/ThrowError";

// Interfaces
import Filter from "@interfaces/Filter";
import IService from "@interfaces/IService";

// Repositories
import {
    achievementRepository
} from "@repositories/index";

export default class AchievementService implements IService<CreateAchievementDTO, UpdateAchievementDTO, AchievementDTO> {
   
    async getAll(filter: Filter): Promise<AchievementDTO[]> {
        try {
            return achievementRepository.getAll(filter);
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Não foi possível buscar as conquistas.");
        }
    }
    async getById(id: string): Promise<AchievementDTO | null> {
        try {
            return await achievementRepository.getById(id);
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Não foi possível buscar a conquista.");
        }
    }
    async create(data: CreateAchievementDTO): Promise<AchievementDTO> {
        try {
            return await achievementRepository.create(data);
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Não foi possível criar a conquista.");
        }
    }
    async update(id: string, data: UpdateAchievementDTO): Promise<AchievementDTO | null> {
        try {
            return await achievementRepository.update(id, data);
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Não foi possível atualizar a conquista.");
        }
    }
    async delete(id: string): Promise<void> {
        try {
            await achievementRepository.delete(id);
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Não foi possível deletar a conquista.");
        }
    }


}