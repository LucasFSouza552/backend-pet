// DTOS
import { createPetInteractionDTO } from "@dtos/accountPetInteractionDTO";
import { UpdateHistoryDTO } from "@dtos/historyDTO";

// Errors
import { ThrowError } from "@errors/ThrowError";

// Repositories
import { accountPetInteractionRepository, historyRepository } from "@repositories/index";

export default class AccountPetInteractionService {

    async getPetInteractionByAccount(accountId: string, petId: string) {
        try {
            return await accountPetInteractionRepository.getPetInteractionByAccount(accountId, petId);
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Erro ao buscar interação com pet.");
        }
    }

    async getPetInteraction(petId: string) {
        try {
            return await accountPetInteractionRepository.getInteraction(petId);
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Erro ao buscar pet.");
        }
    }

    async create(data: createPetInteractionDTO) {
        try {
            return await accountPetInteractionRepository.create(data);
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Erro ao criar interação com pet.");
        }
    }

    async updateStatus(updateData: createPetInteractionDTO) {
        try {
            const history = await historyRepository.getByAccountAndPet(updateData.account.toString(), updateData.pet.toString());
            if (history) {
                await historyRepository.update(history?.id, {
                    status: "cancelled",
                } as UpdateHistoryDTO);
            }
            const updated = await accountPetInteractionRepository.updateStatus(updateData);
            console.log(updated);
            
            return updated;
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Erro ao atualizar a interação com pet.")
        }
    }

    async deleteInteraction(accountId: string, petId: string) {
        try {
            return await accountPetInteractionRepository.deleteInteraction(accountId, petId);
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Erro ao deletar a interação com pet.")
        }
    }

    async getByAccount(accountId: string) {
        try {
            const interactions = await accountPetInteractionRepository.getByAccountWithPets(accountId);
            return interactions;
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Erro ao buscar interações com os pets.");
        }
    }

    async getViewedPets(accountId: string) {
        try {
            return await accountPetInteractionRepository.getViewedPets(accountId);
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Erro ao buscar pets visualizados.");
        }
    }

}