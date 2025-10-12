import { AccountPetInteraction } from "../models/AccountPetInteraction";
import { IPetInteractionStatus } from "../types/IPetInteractionStatus";

export default class AccountPetInteractionRepository {
    async create(accountId: string, petId: string, status: IPetInteractionStatus) {
        return await AccountPetInteraction.create({ account: accountId, pet: petId, status });
    }

    async updateStatus(accountId: string, petId: string, status: IPetInteractionStatus) {
        return await AccountPetInteraction.findOneAndUpdate(
            { account: accountId, pet: petId },
            { status },
            { new: true, upsert: true }
        );
    }

    async getByAccount(accountId: string) {
        return await AccountPetInteraction.find({ account: accountId });
    }

    async getByPet(petId: string) {
        return await AccountPetInteraction.find({ pet: petId });
    }

    async getInteraction(accountId: string, petId: string) {
        return await AccountPetInteraction.findOne({ account: accountId, pet: petId });
    }
}
