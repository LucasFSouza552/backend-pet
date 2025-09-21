import { FilterQuery } from "mongoose";
import { AchievementDTO, CreateAchievementDTO, UpdateAchievementDTO } from "../dtos/AchievementDTO";
import Filter from "../interfaces/Filter";
import IRepository from "../interfaces/IRepository";
import { IAchievement, Achievements } from "../models/Achievements";
import { ThrowError } from "../errors/ThrowError";

export default class AchievementRepository implements IRepository<CreateAchievementDTO, UpdateAchievementDTO, AchievementDTO> {
    async getAll(filter: Filter): Promise<AchievementDTO[]> {
        try {
            const { page, limit, orderBy, order, query } = filter;

            return await Achievements.find(query as FilterQuery<IAchievement>)
                .sort({ [orderBy]: order })
                .skip((page - 1) * limit)
                .limit(limit) as AchievementDTO[];

        } catch (error: any) {
            throw ThrowError.internal("Erro ao buscar conquistas.");
        }
    }
    async getById(id: string): Promise<AchievementDTO> {
        try {
            const account = await Achievements.findById(id) as AchievementDTO;
            if (!account) {
                throw ThrowError.notFound("Usuário não encontrado.");
            }
            return account;
        } catch (error: any) {
            throw ThrowError.internal("Erro ao buscar conquista.");
        }
    }
    async create(data: CreateAchievementDTO): Promise<AchievementDTO> {
        try {
            const achieviment = new Achievements(data);
            await achieviment.save();
            return achieviment;

        } catch (error: any) {
            if (error.name === "ValidationError") {
                throw ThrowError.badRequest("Dados inválidos: " + error.message);
            }

            throw ThrowError.internal("Erro ao criar conquista.");
        }
    }
    async update(id: string, data: UpdateAchievementDTO): Promise<AchievementDTO> {
        try {

            const achievement = await Achievements.findByIdAndUpdate(id, data, {
                new: true,
                runValidators: true
            });
            if (!achievement) {
                throw ThrowError.internal("Erro ao atualizar conquista.");
            }

            return achievement;

        } catch (error: any) {
            if (error.name === "CastError") {
                throw ThrowError.badRequest("ID inválido.");
            }

            if (error.name === "ValidationError") {
                throw ThrowError.badRequest("Dados inválidos: " + error.message);
            }

            if (error.code === 11000) {
                throw ThrowError.conflict("E-mail já está em uso.");
            }
            throw ThrowError.internal("Erro ao atualizar usuário.");
        }
    }
    async delete(id: string): Promise<void> {
        try {
            const achieviment = await Achievements.findByIdAndDelete(id);
            if (!achieviment) {
                throw ThrowError.notFound("Conquista nao encontrada.");
            }
        } catch (error: any) {
            throw ThrowError.internal("Erro ao deletar conquista.");
        }
    }

}