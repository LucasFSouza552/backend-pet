import { FilterQuery } from "mongoose";
import { CreateHistoryDTO, HistoryDTO, UpdateHistoryDTO } from "@dtos/HistoryDTO";
import Filter from "@interfaces/Filter";
import IRepository from "@interfaces/IRepository";
import IHistory, { History } from "@models/history";

export default class HistoryRepository implements IRepository<CreateHistoryDTO, UpdateHistoryDTO, HistoryDTO> {
    async getRequestedAdoption(institutionId: string, accountId: string) {
        return await History.find({
            institution: institutionId,
            type: "adoption",
            status: "pending",
        })
            .populate({ path: "pet" })
            .populate({ path: "institution" })
            .exec();
    }

    async updateStatus(id: string, status: UpdateHistoryDTO): Promise<HistoryDTO | null> {
        return await History.findByIdAndUpdate(id, { status }, {
            new: true,
            runValidators: true
        });
    }
    async getAll(filter: Filter): Promise<HistoryDTO[]> {
        const { page, limit, orderBy, order, query } = filter;

        return await History.find(query as FilterQuery<IHistory>)
            .sort({ [orderBy]: order })
            .skip((page - 1) * limit)
            .limit(limit);
    }
    async getById(id: string): Promise<HistoryDTO | null> {
        return await History.findById(id);
    }
    async create(data: CreateHistoryDTO): Promise<HistoryDTO> {
        const history = new History(data);
        await history.save();
        return history;
    }
    async update(id: string, data: UpdateHistoryDTO): Promise<HistoryDTO | null> {
        return await History.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true
        });
    }
    async delete(id: string): Promise<void> {
        await History.findByIdAndDelete(id);
    }

    async getByAccount(filter: Filter, account: string): Promise<HistoryDTO[]> {

        const { page, limit, orderBy, order, query } = filter;

        return await History.find({ account, ...query })
            .sort({ [orderBy]: order })
            .skip((page - 1) * limit)
            .limit(limit);
    }

}