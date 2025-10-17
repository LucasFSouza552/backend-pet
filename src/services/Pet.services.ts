import { createPetInteractionDTO } from "@dtos/AccountPetInteractionDTO";
import { CreatePetDTO, UpdatePetDTO } from "@dtos/PetDTO";
import { ThrowError } from "@errors/ThrowError";
import Filter from "@interfaces/Filter";
import IService from "@interfaces/IService";
import IPet, { Pet } from "@models/Pet";
import PetRepository from "@repositories/Pet.repository";
import HistoryRepository from "@repositories/History.repository";
import { CreateHistoryDTO, HistoryDTO } from "@dtos/HistoryDTO";
import AccountService from "@services/Account.services";
import { PictureStorageRepository } from "@repositories/PictureStorage.repository";
import { ObjectId } from "mongodb";
import { preference } from "@config/mergadopago";
import AccountPetInteractionService from "./AccountPetInteraction.services";

const petRepository = new PetRepository();
const historyRepository = new HistoryRepository();
const accountService = new AccountService();
const accountPetInteraction = new AccountPetInteractionService();

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

    async donate(id: string, amount: string, accountId: string) {
        try {
            const { v4: uuidv4 } = await import('uuid');
            const idempotencyKey = uuidv4();

            const account = await accountService.getById(accountId);
            if (!account) throw ThrowError.notFound("Usuário não encontrado.");


            const newHistory: CreateHistoryDTO = {
                type: "donation",
                amount: amount,
                account: account.id as string,
                status: "pending"
            } as CreateHistoryDTO;

            const history = await historyRepository.create(newHistory);
            if (!history) throw ThrowError.internal("Erro ao doar para petApp.");


            const externalReference = `petApp-${newHistory.id}`;

            const body = {
                items: [
                    {
                        title: "Doação",
                        quantity: 1,
                        unit_price: parseFloat(amount),
                        currency_id: "BRL"
                    }
                ],
                payer: {
                    email: account?.email as string
                },
                payment_methods: {
                    excluded_payment_methods: [
                        {
                            id: "ticket"
                        }
                    ],
                    installments: 1
                },
                external_reference: externalReference,
            } as any;

            const response = await preference.create({ body, requestOptions: { idempotencyKey: idempotencyKey } });

            if (!response) throw ThrowError.internal("Erro ao doar para petApp.");

            return {
                id: response.id as string,
                url: response.init_point,
            };

        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Erro ao patrocinar o pet.");
        }
    }

    async sponsor(petId: string, amount: string, accountId: string) {
        try {

            const { v4: uuidv4 } = await import('uuid');
            const idempotencyKey = uuidv4();

            const pet = await petRepository.getById(petId);
            if (!pet) throw ThrowError.notFound("Pet não encontrado.");

            const account = await accountService.getById(accountId);
            if (!account) throw ThrowError.notFound("Usuário não encontrado.");

            if (pet.account === accountId) throw ThrowError.conflict("Usuário proprietário.");

            const newHistory: CreateHistoryDTO = {
                type: "sponsorship",
                amount: amount,
                account: account.id as string,
                status: "pending"
            } as CreateHistoryDTO;

            const history = await historyRepository.create(newHistory);
            if (!history) throw ThrowError.internal("Erro ao doar para petApp.");

            const externalReference = `${pet.account}-${uuidv4()}`;

            const body = {
                items: [
                    {
                        title: "Patrocínio de Pet",
                        quantity: 1,
                        unit_price: parseFloat(amount),
                        currency_id: "BRL"
                    }
                ],
                payer: {
                    email: account?.email as string
                },
                payment_methods: {
                    excluded_payment_methods: [
                        {
                            id: "ticket"
                        }
                    ],
                    installments: 1
                },
                external_reference: externalReference,
            } as any;

            const response = await preference.create({ body, requestOptions: { idempotencyKey: idempotencyKey } });

            if (!response) throw ThrowError.internal("Erro ao patrocinar o pet.");

            return {
                id: response.id as string,
                url: response.init_point,
            };

        } catch (error) {
            if (error instanceof ThrowError) throw error;
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

    async paymentReturn(paymentId: string, status: string, externalReference: string): Promise<HistoryDTO> {
        try {
            const payment = await historyRepository.getById(paymentId);
            if (!payment) throw ThrowError.notFound("Pagamento não encontrado.");

            if (payment.status === "completed" || payment.status === "cancelled" || payment.status === "refunded") throw ThrowError.conflict("Pagamento já processado.");
            if (payment.status !== status) throw ThrowError.conflict("Status do pagamento inválido.");

            if (payment.externalReference !== externalReference) throw ThrowError.conflict("External reference inválido.");

            await historyRepository.update(payment.id, { status: "completed" });

            return payment as HistoryDTO;
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Erro ao processar o retorno do pagamento.");
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

    async getFeed(accountId: string, filter: Filter): Promise<IPet[]> {
        try {
            const interactions = await accountPetInteraction.getByAccount(accountId);
            const seenPetIds = interactions.map((i) => i.id);

            const nextPet = await petRepository.getByList(seenPetIds);

            if (!nextPet) return [];

            await accountPetInteraction.create({
                status: "viewed",
                account: accountId as string,
                pet: nextPet._id as string
            } as createPetInteractionDTO);

            return [nextPet];
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Erro ao buscar o feed.");
        }
    }
}
