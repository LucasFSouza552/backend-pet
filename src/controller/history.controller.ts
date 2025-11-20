import { Request, Response, NextFunction } from "express";

// DTOS
import { CreateHistoryDTO, UpdateHistoryDTO } from "@dtos/historyDTO";

// Interfaces
import IController from "@interfaces/IController";

// Errors
import { ThrowError } from "@errors/ThrowError";

// Utils
import filterConfig from "@utils/filterConfig";
import BuilderDTO from "@utils/builderDTO";

// Services
import { accountService, historyService } from "@services/index";
import { error } from "console";

export default class HistoryController implements IController {
    async updateHistoryStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id;
            const accountId = req.account?.id;
            const status = req.body.status;

            if (!id) throw ThrowError.badRequest("ID não foi informado.");
            if (!accountId) throw ThrowError.unauthorized("Usuário não autenticado.");
            if (!status) throw ThrowError.badRequest("Status deve ser informado.");

            const history = await historyService.updateStatus(id, accountId, { status });
            if (history?.status === "completed") {
                await accountService.addAdoptionAchievement(history?.account as string);
            }
            res.status(200).json(history);
        } catch (error) {
            next(error);
        }
    }
    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const allowedQueryFields: string[] = ["status", "type", "pet", "account", "institution"];
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
                .add({ key: "account" })
                .add({ key: "status" })
                .add({ key: "type" })
                .add({ key: "pet", required: data.type !== "donation" })
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
            const allowedQueryFields: string[] = ["status", "type", "institution"];
            const filters = filterConfig(req.query, allowedQueryFields);

            const accountId = req.account?.id as string;
            
            if(!accountId) {
                throw ThrowError.badRequest("ID é inválido");
            }

            const histories = await historyService.getByAccount(filters, accountId);
            res.status(200).json(histories);
        } catch (error) {
            next(error);
        }
    }
    
    async donate(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const amount = req.body?.amount;
            const accountId = req?.account?.id;

            if (!amount) throw ThrowError.badRequest("Quantidade não foi informada.");
            if (!accountId) throw ThrowError.badRequest("Conta não foi informada.");

            const donation = await historyService.donate(amount, accountId);
            res.status(200).json(donation);
        } catch (error) {
            next(error);
        }
    }

    async sponsor(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const institutionId = req.params.id;
            const amount = req.body?.amount;
            const accountId = req?.account?.id;
            if (!amount) throw ThrowError.badRequest("Quantidade não foi informada.");
            if (!accountId) throw ThrowError.badRequest("Conta não foi informada.");
            if (!institutionId) throw ThrowError.badRequest("ID da instituição não foi informado.");

            const sponsorship = await historyService.sponsor(institutionId as string, amount, accountId as string);
            res.status(200).json(sponsorship);
        } catch (error) {
            next(error);
        }
    }

}