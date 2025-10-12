import { createPetInteractionDTO } from "../dtos/AccountPetInteractionDTO";
import { ThrowError } from "../errors/ThrowError";
import AccountPetInteractionRepository from "../repositories/AccountPetInteraction.repository";
import { IPetInteractionStatus } from "../types/IPetInteractionStatus";

const accountPetInteractionRepository = new AccountPetInteractionRepository();
export default class AccountPetInteractionService {

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
            return await accountPetInteractionRepository.updateStatus(updateData);
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Erro ao atualizar a interação com pet.")
        }
    }

    async getByAccount(accountId: string) {
        try {
            return await accountPetInteractionRepository.getByAccount(accountId);
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Erro ao buscar interações com os pets.");
        }
    }
}