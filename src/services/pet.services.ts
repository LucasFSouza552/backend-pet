// DTOS
import { CreateHistoryDTO, HistoryDTO } from "@dtos/historyDTO";
import { CreatePetDTO, UpdatePetDTO } from "@dtos/petDTO";

// Errors
import { ThrowError } from "@errors/ThrowError";

// Interfaces
import Filter from "@interfaces/Filter";
import IService from "@interfaces/IService";

import IPet from "@models/pet";
import { ObjectId } from "mongodb";

// Repositories
import { PictureStorageRepository } from "@repositories/pictureStorage.repository";
import { historyRepository, petRepository } from "@repositories/index";

// Services
import { accountPetInteractionService, accountService } from "./index";
import { createPetInteractionDTO } from "@dtos/accountPetInteractionDTO";

export default class PetService implements IService<CreatePetDTO, UpdatePetDTO, IPet> {
    async requestedAdoption(institutionId: string) {
        try {
            const history = await historyRepository.getRequestedAdoption(institutionId);
            return history;
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Erro ao solicitar adotação.");
        }
    }

    async getAdoptionsByAccount(accountId: string) {
        try {
            return await petRepository.getAdoptionsByAccount(accountId);
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Erro ao buscar pets adotados.");
        }
    }

    async getPetAndInstitution(petId: string) {
        try {
            return await petRepository.getPetAndInstitution(petId);
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Erro ao buscar pet e instituição.");
        }
    }

    async softDelete(petId: string, accountId: string) {
        try {
            const pet = await petRepository.getById(petId);
            if (pet?.deletedAt) throw ThrowError.conflict("O Pet já foi deletado.");
            if (pet?.account?.toString() !== accountId) throw ThrowError.conflict("Somente o proprietário pode deletar o pet.");
            if (pet?.adopted) throw ThrowError.conflict("O Pet já foi adotado.");
            return await petRepository.softDelete(petId);
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Erro ao deletar pet.");
        }
    }

    async updatePetImages(petId: string, files: Express.Multer.File[]): Promise<ObjectId[]> {
        try {
            const pet = await petRepository.getById(petId);
            if (!pet) throw ThrowError.notFound("Pet não encontrado.");
            const petImages = pet.images || [];

            if (files?.length > 5) throw ThrowError.conflict("Limite de imagens atingido.");
            for (const imageId of petImages) {
                await PictureStorageRepository.deleteImage(imageId);
            }

            const uploadedImages: ObjectId[] = [];
            for (const file of files) {
                if (!file.buffer) continue;

                const imageId = await PictureStorageRepository.uploadImage(file);
                if (imageId) uploadedImages.push(imageId);
            }

            await petRepository.update(petId, { images: uploadedImages });

            return uploadedImages;

        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Erro ao atualizar avatar.");
        }
    }

    async deletePetImage(petId: string, imageId: string | ObjectId, accountId: string) {
        try {
            const pet = await petRepository.getById(petId);
            if (!pet) throw ThrowError.notFound("Pet não encontrado.");
            if (!pet?.images) throw ThrowError.notFound("Imagem não encontrada.");
            if (pet.adopted) throw ThrowError.conflict("O Pet já foi adotado.");
            if (pet.account.toString() !== accountId) throw ThrowError.conflict("Somente o proprietário pode deletar a imagem.");
            await PictureStorageRepository.deleteImage(imageId);

            await petRepository.update(petId, { images: pet.images.filter(image => image !== imageId) });

        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Erro ao deletar imagem.");
        }
    }



    async dislikePet(petId: string, accountId: string) {
        try {
            const account = await accountService.getById(accountId);
            if (!account) throw ThrowError.notFound("Usuário não encontrado.");

            const pet = await petRepository.getById(petId);
            if (!pet) throw ThrowError.notFound("Pet não encontrado.");

            if (pet.account === accountId) throw ThrowError.conflict("Usuário proprietário.");
            const hasInteraction = await accountPetInteractionService.getPetInteractionByAccount(account.id as string, pet.id as string);
            console.log("hasInteraction", hasInteraction);
            const newInteraction: createPetInteractionDTO = {
                account: account.id as string,
                pet: pet.id as string,
                status: "disliked",
            } as createPetInteractionDTO;

            if (hasInteraction) {
                await accountPetInteractionService.updateStatus(newInteraction);
            } else {
                const interaction = await accountPetInteractionService.create(newInteraction);
                if (!interaction) throw ThrowError.internal("Erro ao solicitar adotação.");
            }

        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Erro ao rejeitar adotação.");
        }
    }

    async likePet(petId: string, accountId: string): Promise<HistoryDTO> {
        try {

            const account = await accountService.getById(accountId);
            if (!account) throw ThrowError.notFound("Usuário não encontrado.");

            const pet = await petRepository.getById(petId);
            if (!pet) throw ThrowError.notFound("Pet não encontrado.");

            if (pet.adopted) throw ThrowError.conflict("Pet já foi adotado.");

            if (pet?.account?.toString() === accountId) throw ThrowError.conflict("Usuário proprietário.");

            const newHistory: CreateHistoryDTO = {
                type: "adoption",
                pet: pet.id as string,
                account: account.id as string,
                institution: pet.account as string,
                status: "pending"
            } as CreateHistoryDTO;

            const history = await historyRepository.create(newHistory as CreateHistoryDTO);
            if (!history) throw ThrowError.internal("Erro ao solicitar adotação.");

            const hasInteraction = await accountPetInteractionService.getPetInteractionByAccount(account.id as string, pet.id as string);
            const newInteraction: createPetInteractionDTO = {
                account: account.id as string,
                pet: pet.id as string,
                status: "liked",
            } as createPetInteractionDTO;

            if (hasInteraction) {
                await accountPetInteractionService.updateStatus(newInteraction);
            } else {
                const interaction = await accountPetInteractionService.create(newInteraction);
                if (!interaction) throw ThrowError.internal("Erro ao solicitar adotação.");
            }

            return history;

        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Erro ao solicitar adotação.");
        }
    }

    async acceptRequestedAdoption(petId: string, accountId: string, institutionId: string) {
        try {
            const pet = await petRepository.getById(petId);
            if (!pet) throw ThrowError.notFound("Pet não encontrado.");
            if (!pet.account) throw ThrowError.forbidden("Conta não existente")
            if (pet.adopted) throw ThrowError.conflict("Pet já foi adotado.");
            if (pet.account.toString() !== institutionId) throw ThrowError.conflict("Somente a instituição pode aceitar adotação.");

            const history = await historyRepository.getByAccountAndPet(accountId, petId);
            if (!history) throw ThrowError.notFound("Histórico não encontrado.");
            if (history.status !== "pending") throw ThrowError.conflict("Histórico já processado.");

            await historyRepository.update(history.id, { status: "completed" });
            const updatedPet = await petRepository.update(petId, { adopted: true, account: accountId });

            const histories = await historyRepository.getByPetId(petId);
            for (const history of histories) {
                if (history.status === "pending") {
                    await historyRepository.update(history.id, { status: "cancelled" });
                }
            }

            if (!updatedPet) throw ThrowError.internal("Erro ao aceitar adotação.");
            return updatedPet;
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Erro ao aceitar adotação.");
        }
    }

    async rejectRequestedAdoption(petId: string, accountId: string, institutionId: string) {
        try {
            const pet = await petRepository.getById(petId);
            if (!pet) throw ThrowError.notFound("Pet não encontrado.");
            if (!pet.account) throw ThrowError.forbidden("Conta não existente");
            if (pet.adopted) throw ThrowError.conflict("Pet já foi adotado.");
            if (pet.account.toString() !== institutionId) throw ThrowError.conflict("Somente a instituição pode rejeitar adotação.");

            const history = await historyRepository.getByAccountAndPet(accountId, petId);

            if (!history) throw ThrowError.notFound("Histórico não encontrado.");
            if (history.status !== "pending") throw ThrowError.conflict("Histórico já processado.");
            await historyRepository.update(history.id, { status: "cancelled" });

        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Erro ao rejeitar adotação.");
        }
    }

    async getAll(filter: Filter): Promise<IPet[]> {
        try {
            return await petRepository.getAll(filter);
        } catch (error: any) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Erro ao buscar os pets.");
        }
    }

    async getAllByInstitution(filter: Filter) {
        try {
            return await petRepository.getAll(filter);
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Erro ao buscar pets da instituição.");
        }
    }

    async getById(id: string): Promise<IPet | null> {
        try {
            const pet = await petRepository.getById(id);
            if (!pet) throw ThrowError.notFound("Pet não encontrado.");
            return pet;
        } catch (error: any) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Erro ao buscar o pet.");
        }
    }

    async create(data: CreatePetDTO): Promise<IPet> {
        try {
            const pet = await petRepository.create(data);
            if (!pet) throw ThrowError.conflict("Não foi possível cadastrar o pet.");
            return pet;
        } catch (error: any) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Erro ao criar o pet.");
        }
    }

    async update(id: string, data: UpdatePetDTO): Promise<IPet | null> {
        try {
            const pet = await petRepository.update(id, data);
            if (!pet) throw ThrowError.notFound("Pet não encontrado para atualização.");
            return pet;
        } catch (error: any) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Erro ao atualizar o pet.");
        }
    }

    async delete(id: string): Promise<void> {
        try {
            const pet = await petRepository.getById(id);
            if (!pet) throw ThrowError.notFound("Pet não encontrado para exclusão.");
            await petRepository.delete(id);
        } catch (error: any) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Erro ao deletar o pet.");
        }
    }

    async updatePet(id: string, data: UpdatePetDTO, accountId: string): Promise<IPet | null> {
        try {
            const pet = await petRepository.getById(id);
            if (!pet) throw ThrowError.notFound("Pet não encontrado.");
            if (pet.account.toString() !== accountId) throw ThrowError.conflict("Somente o proprietário pode atualizar o pet.");
            return await petRepository.update(id, data);
        } catch (error: any) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Erro ao atualizar o pet.");
        }
    }
}
