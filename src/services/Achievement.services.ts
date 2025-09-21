import { AchievementDTO, CreateAchievementDTO, UpdateAchievementDTO } from "../dtos/AchievementDTO";
import { ThrowError } from "../errors/ThrowError";
import Filter from "../interfaces/Filter";
import IService from "../interfaces/IService";
import { IAchievement } from "../models/Achievements";
import AchievementRepository from "../repositories/Achievement.repository";

const achievementRepository = new AchievementRepository();

export class AchievementService implements IService<CreateAchievementDTO, UpdateAchievementDTO, IAchievement> {
    async getAll(filter: Filter): Promise<IAchievement[]> {
        try {
            return achievementRepository.getAll(filter);
        } catch (error) {
            throw ThrowError.internal("");
        }
    }
    async getById(id: string): Promise<IAchievement> {
        try {
            return await achievementRepository.getById(id);
        } catch (error) {
            throw ThrowError.internal("");
        }
    }
    async create(data: CreateAchievementDTO): Promise<CreateAchievementDTO> {
        try {
            return await achievementRepository.create(data);
        } catch (error) {
            throw ThrowError.internal("");
        }
    }
    async update(id: string, data: UpdateAchievementDTO): Promise<AchievementDTO> {
        try {
            return await achievementRepository.update(id, data);
        } catch (error) {
            throw ThrowError.internal("");
        }
    }
    async delete(id: string): Promise<void> {
        try {
            await achievementRepository.delete(id);
        } catch (error) {
            throw ThrowError.internal("");
        }
    }

}