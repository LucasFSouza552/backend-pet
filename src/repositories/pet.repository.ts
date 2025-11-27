import IPet from "@models/pet";
import { Pet } from "@models/pet";
import Filter from "@interfaces/Filter";
import IRepository from "@interfaces/IRepository";
import { CreatePetDTO, UpdatePetDTO } from "@dtos/petDTO";
import { FilterQuery, Types } from "mongoose";

export default class PetRepository implements IRepository<CreatePetDTO, UpdatePetDTO, IPet> {
    async getPetAndInstitution(petId: string) {
        return await Pet.findById(petId).populate("account");
    }
    async getAdoptionsByAccount(accountId: string) {
        return await Pet.find({ adopted: true, account: accountId });
    }
    async softDelete(petId: string) {
        await Pet.findByIdAndUpdate(petId, { deletedAt: new Date() });
    }

    async getALL() {
        return await Pet.find({ adopted: false });
    }

    async getAll(filter: Filter): Promise<IPet[]> {
        const { page, limit, orderBy, order, query } = filter;

        const pets = await Pet.find({ ...query, adopted: false } as FilterQuery<IPet>)
            .sort({ [orderBy]: order, _id: 1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate("account")
            .exec();
        return pets;
    }

    async getById(id: string): Promise<IPet | null> {
        return await Pet.findById(id);
    }

    async create(data: CreatePetDTO): Promise<IPet> {
        const pet = new Pet(data);
        return await pet.save();
    }

    async update(id: string, data: UpdatePetDTO): Promise<IPet | null> {
        const updatedPet = await Pet.findByIdAndUpdate(id, data, { new: true, runValidators: true }) as unknown as IPet | null;
        return updatedPet;
    }

    async delete(id: string): Promise<void> {
        await Pet.findByIdAndDelete(id);
    }

    async getNextAvailable(seenPetIds: Types.ObjectId[]): Promise<IPet | null> {
        return await Pet.findOne({
            _id: { $nin: seenPetIds },
            adopted: false,
        })
            .sort({ createdAt: 1 })
            .populate("account", "name address")
            .exec();
    }
}
