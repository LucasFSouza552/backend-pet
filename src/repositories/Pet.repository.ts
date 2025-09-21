import IPet from "../models/Pet";
import { Pet } from "../models/Pet";
import Filter from "../interfaces/Filter";

export default class PetRepository {
    async getAll(filter: Filter): Promise<IPet[]> {
        return await Pet.find(filter);
    }

    async getById(id: string): Promise<IPet | null> {
        return await Pet.findById(id);
    }

    async create(data: IPet): Promise<IPet> {
        const pet = new Pet(data);
        return await pet.save();
    }

    async update(id: string, data: Partial<IPet>): Promise<IPet | null> {
        return await Pet.findByIdAndUpdate(id, data, { new: true });
    }

    async delete(id: string): Promise<void> {
        await Pet.findByIdAndDelete(id);
    }
}
