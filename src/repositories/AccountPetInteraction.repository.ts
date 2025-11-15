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

    async getByAccount(account: string) {
        return await AccountPetInteraction.find({ account, status: { $ne: "viewed" } }).lean({ virtuals: true }).exec();
    }

    async getByAccountWithPets(account: string) {
        const accountpetInteraction = await AccountPetInteraction
            .find({ account, status: { $ne: "viewed" } })
            .populate({
                path: "pet",
                select: "name type account description age gender weight images adopted instituition",
                options: {
                    lean: {
                        virtuals: true,
                        getters: true
                    }
                },
                populate: {
                    path: "account",
                },

            })
            .lean({ virtuals: true })
            .exec();

        return accountpetInteraction;
    }
 

    async getInteraction(petId: string) {
        return await AccountPetInteraction.findOne({ pet: petId });
    }

    async getViewedPets(accountId: string) {
        return await AccountPetInteraction.find({ account: accountId, status: "viewed" });
    }
}
