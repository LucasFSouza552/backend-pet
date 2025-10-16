import { FilterQuery } from "mongoose";
import { AchievementDTO, CreateAchievementDTO, UpdateAchievementDTO } from "@dtos/AchievementDTO";
import Filter from "@interfaces/Filter";
import IRepository from "@interfaces/IRepository";
import { IAchievement, Achievements } from "@models/Achievements";

export default class AchievementRepository implements IRepository<CreateAchievementDTO, UpdateAchievementDTO, AchievementDTO> {
    async getByType(type: string) {
        return await Achievements.findOne({ type });
    }
    async getAll(filter: Filter): Promise<AchievementDTO[]> {
        const { page, limit, orderBy, order, query } = filter;

        return await Achievements.find(query as FilterQuery<IAchievement>)
            .sort({ [orderBy]: order })
            .skip((page - 1) * limit)
            .limit(limit) as AchievementDTO[];
    }
    async getById(id: string): Promise<AchievementDTO | null> {
        const account = await Achievements.findById(id) as AchievementDTO;
        return account;
    }
    async create(data: CreateAchievementDTO): Promise<AchievementDTO> {
        const achieviment = new Achievements(data);
        await achieviment.save();
        return achieviment;
    }
    async update(id: string, data: UpdateAchievementDTO): Promise<AchievementDTO | null> {

        const achievement = await Achievements.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true
        });

        return achievement;
    }
    async delete(id: string): Promise<void> {
        await Achievements.findByIdAndDelete(id);
    }
}