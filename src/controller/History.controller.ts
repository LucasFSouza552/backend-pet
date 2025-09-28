import { Request, Response, NextFunction } from "express";
import IController from "../interfaces/IController";
import HistoryService from "../services/History.services";
import filterConfig from "../utils/filterConfig";
import { ThrowError } from "../errors/ThrowError";
import BuilderDTO from "../utils/builderDTO";
import { CreateHistoryDTO, UpdateHistoryDTO } from "../dtos/HistoryDTO";

const historyService = new HistoryService();

export default class HistoryController implements IController {
    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const allowedQueryFields: string[] = ["status", "type", "entityId", "accountId"];
            const filters = filterConfig(req.query, allowedQueryFields);
            const histories = await historyService.getAll(filters);
            res.status(200).json(histories);
        } catch (error) {
            next(error);
        }
    }
    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id;
            if (!id) throw ThrowError.badRequest("ID não foi informado.");
            const history = await historyService.getById(id);
            res.status(200).json(history);
        } catch (error) {
            next(error);
        }
    }
    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id;
            if (!id) throw ThrowError.badRequest("ID não foi informado.");

            const updateData = new BuilderDTO<UpdateHistoryDTO>(req.body)
                .add({ key: "accountId", required: false })
                .add({ key: "status", type: "string" })
                .add({ key: "type", type: "string" })
                .add({ key: "petId", required: req.body.type !== "donation" })
                .add({ key: "amount", required: req.body.type !== "adoption" })
                .build();

            const history = await historyService.update(id, updateData);
            res.status(200).json(history);
        } catch (error) {
            next(error);
        }
    }
    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id;
            if (!id) throw ThrowError.badRequest("ID não foi informado.");
            await historyService.delete(id);
            res.status(204).json();
        } catch (error) {
            next(error);
        }
    }


    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = req?.body;
            const newHistory = new BuilderDTO<CreateHistoryDTO>(data)
                .add({ key: "accountId" })
                .add({ key: "status" })
                .add({ key: "type" })
                .add({ key: "petId", required: data.type !== "donation" })
                .add({ key: "amount", required: data.type !== "adoption" })
                .build();

            const history = await historyService.create(newHistory);
            res.status(201).json(history);
        } catch (error) {
            next(error);
        }
    }

    async listByAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const accountId = req.accountId as string;
            const histories = await historyService.getById(accountId);
            res.status(200).json(histories);
        } catch (error) {
            next(error);
        }
    }

    async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id as string;

            const updateData = new BuilderDTO<UpdateHistoryDTO>(req.body)
                .add({ key: "accountId" })
                .add({ key: "status", type: "string" })
                .add({ key: "type", type: "string" })
                .add({ key: "petId", required: req.body.type !== "donation" })
                .add({ key: "amount", required: req.body.type !== "adoption" })
                .build();
                
            const history = await historyService.update(id, updateData);
            res.status(200).json(history);
        } catch (error) {
            next(error);
        }
    }
}