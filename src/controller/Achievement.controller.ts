import { CreateAchievementDTO } from "./../dtos/AchievementDTO";
import { Request, Response, NextFunction } from "express";
import IController from "../interfaces/IController";
import filterConfig from "../utils/filterConfig";
import Filter from "../interfaces/Filter";
import { AchievementService } from "../services/Achievement.services";
import BuilderDTO from "../utils/builderDTO";

const achievementService = new AchievementService();

export default class AchievementController implements IController {
    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const allowedQueryFields: string[] = ["name", "description", "type"];
            const filters: Filter = filterConfig(req.query, allowedQueryFields);

            const achievements = await achievementService.getAll(filters);
            res.status(200).json(achievements);
        } catch (error) {
            next(error);
        }
    }
    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id;
            if (!id) {
                throw new Error("ID não foi informado.");
            }
            const achievement = await achievementService.getById(id);
            res.status(200).json(achievement);
        } catch (error) {
            next(error);
        }
    }
    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const newAchievement = new BuilderDTO<CreateAchievementDTO>(req.body)
                .add({ key: "name", type: "string" })
                .add({ key: "description", type: "string" })
                .add({ key: "type", type: "string" })
                .build();

            const achievement = await achievementService.create(newAchievement);
            res.status(201).json(achievement);
        } catch (error) {
            next(error);
        }
    }
    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id;
            if (!id) {
                throw new Error("ID não foi informado.");
            }
            const achievementUpdateData = new BuilderDTO<CreateAchievementDTO>(req.body)
                .add({ key: "name", required: false })
                .add({ key: "description", required: false })
                .add({ key: "type", required: false })
                .build();

            const achievement = await achievementService.update(id, achievementUpdateData);
            res.status(200).json(achievement);
        } catch (error) {
            next(error);
        }
    }
    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id;
            if (!id) {
                throw new Error("ID não foi informado.");
            }
            await achievementService.delete(id);
            res.status(204).json();
        } catch (error) {
            next(error);
        }
    }

}