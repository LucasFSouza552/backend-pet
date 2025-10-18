import { AccountPetInteraction } from "@models/AccountPetInteraction";
import { createPetInteractionDTO, updatePetInteractionDTO } from "@dtos/AccountPetInteractionDTO";

export default class AccountPetInteractionRepository {
    async create(data: createPetInteractionDTO) {
        return await AccountPetInteraction.create(data);
    }

    async updateStatus(updateData: updatePetInteractionDTO) {
        return await AccountPetInteraction.findOneAndUpdate(
            { account: updateData.account, pet: updateData.pet },
            { status: updateData.status },
            { new: true, upsert: true }
        );
    }

    async getByAccount(accountId: string) {
        return await AccountPetInteraction.find({ account: accountId });
    }

    async getInteraction(petId: string) {
        return await AccountPetInteraction.findOne({ pet: petId });
    }

    async getViewedPets(accountId: string) {
        return await AccountPetInteraction.find({ account: accountId, status: "viewed" });
    }
}
