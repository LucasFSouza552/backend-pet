import { IHistoryStatus } from "./../types/IHistoryStatus";
import { CreateHistoryDTO, HistoryDTO, UpdateHistoryDTO } from "../dtos/HistoryDTO";
import { ThrowError } from "../errors/ThrowError";
import Filter from "../interfaces/Filter";
import IService from "../interfaces/IService";
import HistoryRepository from "../repositories/History.repository";
import { AccountService } from "./Account.services";
import { PetService } from "./Pet.services";

const historyRepository = new HistoryRepository();
const petService = new PetService();
const accountService = new AccountService();

export default class HistoryService implements IService<CreateHistoryDTO, UpdateHistoryDTO, HistoryDTO> {
    async updateStatus(id: string, accountId: string, data: UpdateHistoryDTO): Promise<HistoryDTO | null> {
        try {
            const account = await accountService.getById(accountId);
            if (!account) throw ThrowError.notFound("Usuário não encontrado.");

            if (!data?.status) {
                throw ThrowError.badRequest("Status deve ser informado.");
            }

            if (!IHistoryStatus.includes(data?.status)) {
                throw ThrowError.badRequest("Status inválido.");
            }

            const history = await historyRepository.getById(id);
            if (!history) throw ThrowError.notFound("Histórico não encontrado.");
            if(history.type !== "adoption") throw ThrowError.forbidden("Acesso negado."); 
            if (history?.institution !== account.id) throw ThrowError.forbidden("Acesso negado.");

            const updatedHistory = await historyRepository.updateStatus(id, data);
            if (!updatedHistory) throw ThrowError.notFound("Histórico não encontrado.");
            return history;
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Erro ao atualizar histórico.");
        }
    }
    async getAll(filter: Filter): Promise<HistoryDTO[]> {
        try {
            const histories = await historyRepository.getAll(filter);
            return histories;
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Não foi possível listar os históricos.");
        }
    }
    async getById(id: string): Promise<HistoryDTO | null> {
        try {
            const history = await historyRepository.getById(id);
            if (!history) throw ThrowError.notFound("Histórico não encontrado.");
            return history;
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Erro ao buscar histórico.");
        }
    }
    async create(data: CreateHistoryDTO): Promise<HistoryDTO> {
        try {
            if (!data?.pet) {
                throw ThrowError.badRequest("Pet deve ser informado.");
            }
            const pet = await petService.getById(data?.pet as string);
            if (!pet) throw ThrowError.notFound("Pet não encontrado.");
            if (pet.adopted) throw ThrowError.conflict("Não é possível realizar está ação, pois o pet foi adotado.");

            const history = await historyRepository.create(data);
            if (!history) throw ThrowError.internal("Erro ao criar histórico.");
            return history;
        } catch (error) {
            throw ThrowError.internal("Erro ao criar histórico.");
        }
    }
    async update(id: string, data: UpdateHistoryDTO): Promise<HistoryDTO | null> {
        try {
            if (!data?.pet) {
                throw ThrowError.badRequest("Pet deve ser informado.");
            }
            const pet = await petService.getById(data.pet as string);
            if (!pet) throw ThrowError.notFound("Pet não encontrado.");
            if (pet.adopted) throw ThrowError.conflict("Não é possível realizar esta ação, pois o pet foi adotado.");


            const history = await historyRepository.update(id, data);
            if (!history) throw ThrowError.notFound("Histórico não encontrado.");
            return history;
        } catch (error) {
            throw ThrowError.internal("Erro ao atualizar histórico.");
        }
    }
    async delete(id: string): Promise<void> {
        try {
            const history = await historyRepository.getById(id);
            if (!history) throw ThrowError.notFound("Histórico não encontrado.");
            await historyRepository.delete(id);
        } catch (error) {
            throw ThrowError.internal("Erro ao deletar histórico.");
        }
    }

}