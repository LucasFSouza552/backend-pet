import { FilterQuery, Types } from "mongoose";
import { CreateHistoryDTO, HistoryDTO, UpdateHistoryDTO } from "@dtos/historyDTO";
import Filter from "@interfaces/Filter";
import IRepository from "@interfaces/IRepository";
import IHistory, { History } from "@models/history";

export default class HistoryRepository implements IRepository<CreateHistoryDTO, UpdateHistoryDTO, HistoryDTO> {
    async getRequestedAdoption(institutionId: string) {
        return await History.find({
            institution: institutionId,
            type: "adoption",
            status: "pending",
        })
            .populate({ path: "pet" })
            .populate({ path: "institution" })
            .populate({ path: 'account' })
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
            .sort({ [orderBy]: order, _id: 1 })
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

    async getByPetId(pet: string): Promise<IHistory[]> {
        return await History.find({ pet: new Types.ObjectId(pet) });
    }

    async getByAccount(filter: Filter, account: string): Promise<HistoryDTO[]> {

        const { page, limit, orderBy, order, query } = filter;

        return await History.find({ account, ...query })
            .sort({ [orderBy]: order, _id: 1 })
            .skip((page - 1) * limit)
            .populate("institution", "name email avatar phone_number address role createdAt verified")
            .populate("pet")
            .limit(limit);
    }

    async getByAccountAndPet(account: string, pet: string): Promise<IHistory | null> {
        return await History.findOne({ account: new Types.ObjectId(account), pet: new Types.ObjectId(pet)});
    }

    async getPendingByAccountAndPet(account: string, pet: string): Promise<IHistory | null> {
        return await History.findOne({ account: new Types.ObjectId(account), pet: new Types.ObjectId(pet), status: "pending" });
    }

}