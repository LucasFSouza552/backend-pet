import { CreatePetDTO } from "./../dtos/PetDTO";
import { UpdatePetDTO } from "../dtos/PetDTO";
import { ThrowError } from "../errors/ThrowError";
import Filter from "../interfaces/Filter";
import IService from "../interfaces/IService";
import IPet from "../models/Pet";
import PetRepository from "../repositories/Pet.repository";
import HistoryRepository from "../repositories/History.repository";
import { CreateHistoryDTO, HistoryDTO } from "../dtos/HistoryDTO";
import AccountService from "./Account.services";
import { PictureStorageRepository } from "../repositories/PictureStorage.repository";
import { ObjectId } from "mongodb";
import { order } from "../config/mergadopago";
import { v4 as uuidv4 } from "uuid";

const petRepository = new PetRepository();
const historyRepository = new HistoryRepository();
const accountService = new AccountService();

export class PetService implements IService<CreatePetDTO, UpdatePetDTO, IPet> {
    async updatePetImages(petId: string, files: Express.Multer.File[]): Promise<ObjectId[]> {
        try {
            const pet = await petRepository.getById(petId);
            if (!pet) throw ThrowError.notFound("Pet não encontrado.");
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

    async deletePetImage(petId: string, imageId: string | ObjectId) {
        try {
            const pet = await petRepository.getById(petId);
            if (!pet) throw ThrowError.notFound("Pet não encontrado.");

            await PictureStorageRepository.deleteImage(imageId);

            await petRepository.update(petId, { images: pet.images.filter(image => image !== imageId) });

        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Erro ao deletar imagem.");
        }
    }

    async donate(id: string, amount: number, accountId: string) {
        try {

        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Erro ao doar para o pet.");
        }
    }

    async sponsor(id: string, amount: string, accountId: string) {
        try {
            try {
                const idempotencyKey = uuidv4();
                const body = {
                    type: "online",
                    processing_mode: "automatic",
                    description: "Patrocinio do pet.",
                    payer: {
                        email: "emailfalso@hotmail.com"
                    },
                    transactions: {
                        payments: [
                            {
                                amount: "1000.00",
                                payment_method: {
                                    id: "master",
                                    type: "credit_card",
                                    token: "2926162247",
                                    installments: 1,
                                    statement_descriptor: "Store name",
                                },
                            },
                        ],
                    },
                }

                const requestOptions = {
                    idempotencyKey,
                };

                const response = await order.create({ body, requestOptions }).then((response) => response).catch((error) => error);

                console.log("Pagamento criado com sucesso:", response);
            } catch (error) {
                console.error("Erro ao criar pagamento:", error);
            }

        } catch (error) {
            if (error instanceof ThrowError) throw error;
            console.log(error);
            throw ThrowError.internal("Erro ao patrocinar o pet.");
        }
    }

    async requestAdoption(petId: string, accountId: string): Promise<HistoryDTO> {
        try {

            const account = await accountService.getById(accountId);
            if (!account) throw ThrowError.notFound("Usuário não encontrado.");

            const pet = await petRepository.getById(petId);
            if (!pet) throw ThrowError.notFound("Pet não encontrado.");

            if (pet.adopted) throw ThrowError.conflict("Pet já foi adotado.");

            if (pet.account === accountId) throw ThrowError.conflict("Usuário proprietário.");

            const newHistory: CreateHistoryDTO = {
                type: "adoption",
                pet: pet.id as string,
                account: account.id as string,
                institution: pet.account as string,
                status: "pending"
            } as CreateHistoryDTO;

            const history = await historyRepository.create(newHistory as CreateHistoryDTO);
            if (!history) throw ThrowError.internal("Erro ao solicitar adotação.");

            await petRepository.update(pet.id, { adopted: true });

            return history;

        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Erro ao solicitar adotação.");
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
}
