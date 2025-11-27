// Types
import { IHistoryStatus } from "@Itypes/IHistoryStatus";

// DTOS
import { CreateHistoryDTO, HistoryDTO, UpdateHistoryDTO } from "@dtos/historyDTO";

// Errors
import { ThrowError } from "@errors/ThrowError";

// Interfaces
import Filter from "@interfaces/Filter";
import IService from "@interfaces/IService";

// Config
import { preference } from "@config/mergadopago";

// Repositories
import {
    historyRepository,
    petRepository
} from "@repositories/index";

// Services
import {
    petService,
    accountService
} from "./index";

export default class HistoryService implements IService<CreateHistoryDTO, UpdateHistoryDTO, HistoryDTO> {
    async getByAccount(filter: Filter, accountId: string) {
        try {
            const histories = await historyRepository.getByAccount(filter, accountId);

            if (!histories) throw ThrowError.notFound("Históricos não encontrados.");
            return histories;
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Erro ao buscar históricos.");
        }
    }
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
            if (history.type !== "adoption") throw ThrowError.forbidden("Acesso negado.");
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

    async donate(amount: string, accountId: string) {
        try {
            const { v4: uuidv4 } = await import('uuid');
            const idempotencyKey = uuidv4();

            const account = await accountService.getById(accountId);
            if (!account) throw ThrowError.notFound("Usuário não encontrado.");


            const externalReference = `donation-${account.id}-${uuidv4()}`;

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

            const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

            const newHistory: CreateHistoryDTO = {
                type: "donation",
                amount: amount,
                account: account.id as string,
                status: "pending",
                urlPayment: response.init_point as string,
                expiresAt
            } as CreateHistoryDTO;

            const history = await historyRepository.create(newHistory);
            if (!history) throw ThrowError.internal("Erro ao doar para petApp.");

            return {
                id: response.id as string,
                url: response.init_point,
            };

        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Erro ao doar para petApp.");
        }
    }

    async sponsor(institutionId: string, amount: string | number, accountId: string) {
        try {
            const { v4: uuidv4 } = await import('uuid');
            const idempotencyKey = uuidv4();

            const institution = await accountService.getById(institutionId);
            if (!institution) throw ThrowError.notFound("Instituição não encontrada.");

            const account = await accountService.getById(accountId);
            if (!account) throw ThrowError.notFound("Usuário não encontrado.");

            if (institution.id === accountId) throw ThrowError.conflict("Usuário proprietário.");



            const externalReference = `${institution.id}-${account.id}-${uuidv4()}`;

            const body = {
                items: [
                    {
                        title: "Patrocínio para instituição",
                        quantity: 1,
                        unit_price: typeof amount === "string" ? parseFloat(amount) : amount,
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

            if (!response) throw ThrowError.internal("Erro ao patrocinar a instituição.");

            const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

            const newHistory: CreateHistoryDTO = {
                type: "sponsorship",
                amount: amount,
                account: account.id as string,
                institution: institution.id as string,
                status: "pending",
                urlPayment: response.init_point as string,
                expiresAt
            } as CreateHistoryDTO;

            const history = await historyRepository.create(newHistory);
            if (!history) throw ThrowError.internal("Erro ao patrocinar a instituição.");

            return {
                id: response.id as string,
                url: response.init_point,
            };

        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Erro ao patrocinar a instituição.");
        }
    }

    async paymentReturn(paymentId: string, status: string, externalReference: string): Promise<HistoryDTO> {
        try {
            const payment = await historyRepository.getById(paymentId);
            if (!payment) throw ThrowError.notFound("Pagamento não encontrado.");

            if (payment.expiresAt && payment.expiresAt < new Date()) {
                await historyRepository.update(payment.id as string, { status: "cancelled" });
                throw ThrowError.conflict("Pagamento expirado.");
            }

            if (payment.status !== "pending") throw ThrowError.conflict("Pagamento já processado.");
            if (payment.status !== status) throw ThrowError.conflict("Status do pagamento inválido.");

            if (payment.externalReference !== externalReference) throw ThrowError.conflict("External reference inválido.");

            await historyRepository.update(payment.id, { status: "completed" });

            return payment as HistoryDTO;
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Erro ao processar o retorno do pagamento.");
        }
    }

}