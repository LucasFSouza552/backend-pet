import { AccountPetInteraction } from "@models/accountPetInteraction";
import { createPetInteractionDTO, updatePetInteractionDTO } from "@dtos/accountPetInteractionDTO";

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

    async deleteInteraction(accountId: string, petId: string) {
        return await AccountPetInteraction.findOneAndDelete({ account: accountId, pet: petId });
    }

    async getByAccount(account: string) {
        return await AccountPetInteraction.find({ account, status: { $ne: "viewed" } }).populate({
            path: "pet",
        }).exec();
    }

    async getByAccountWithPets(account: string) {
        const accountpetInteraction = await AccountPetInteraction
            .find({ account, status: { $ne: "viewed" } })
            .populate({
                path: "pet",
                match: { 
                    adopted: false,
                    deletedAt: null
                },
                populate: {
                    path: "account",
                    select: "-password"
                }
            })
            .exec();

        return accountpetInteraction.filter(interaction => interaction.pet !== null);
    }


    async getInteraction(petId: string) {
        return await AccountPetInteraction.findOne({ pet: petId });
    }

    async getViewedPets(accountId: string) {
        return await AccountPetInteraction.find({ account: accountId, status: "viewed" });
    }

    async getPetInteractionByAccount(accountId: string, petId: string) {
        return await AccountPetInteraction.findOne({ account: accountId, pet: petId });
    }
}
