import { IAchievement } from "../models/Achievements";
import { AccountDTO, ChangePasswordDTO, CreateAccountDTO, UpdateAccountDTO, UpdateAvatarDTO } from "../dtos/AccountDTO";
import { ThrowError } from "../errors/ThrowError";
import Filter from "../interfaces/Filter";
import IService from "../interfaces/IService";
import accountMapper from "../Mappers/accountMapper";
import AccountRepository from "../repositories/Account.repository";
import { cryptPassword } from "../utils/aes-crypto";
import AccountAchievementRepository from "../repositories/AccountAchievement.repository";
import AchievementRepository from "../repositories/Achievement.repository";
import { addAchieviment } from "../dtos/AccountAchievementDTO";
import { PictureStorageRepository } from "../repositories/PictureStorage.repository";
import PostRepository from "../repositories/Post.repository";
import achievementMapper from "../Mappers/achievementMapper";
import AuthRepository from "../repositories/Auth.repository";

const authRepository = new AuthRepository();
const accountRepository = new AccountRepository();
const accountAchievementRepository = new AccountAchievementRepository();
const achievementsRepository = new AchievementRepository();
const postRepository = new PostRepository();

export default class AccountService implements IService<CreateAccountDTO, UpdateAccountDTO, AccountDTO> {
    async search(filters: Filter) {
        try {
            return await accountRepository.search(filters);
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            console.log(error);
            throw ThrowError.internal("Erro ao buscar usuários.");
        }

    }
    async getStatusByAccount(accountId: string) {
        try {
            const postCount = await postRepository.getCountPosts(accountId);
            const achievements = await accountAchievementRepository.getByAccountId(accountId);

            const achievementMapped = achievements.map((item) => achievementMapper(item.achievement as unknown as IAchievement));
            return { postCount, achievements: achievementMapped };
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Erro ao buscar status.");
        }
    }
    async updateAvatar(accoundId: string, file: Express.Multer.File): Promise<UpdateAvatarDTO> {
        try {
            if (!file || !file.buffer) {
                throw ThrowError.badRequest("Arquivo inválido ou vazio");
            }

            const account = await accountRepository.getById(accoundId);
            if (!account) throw ThrowError.notFound("Erro ao atualizar avatar.");

            if (account.avatar) {
                await PictureStorageRepository.deleteImage(account.avatar);
            }

            const avatarId = await PictureStorageRepository.uploadImage(file);
            if (!avatarId) throw ThrowError.badRequest("Erro ao atualizar avatar.");

            await accountRepository.updateAvatar(accoundId, avatarId);


            return { avatar: avatarId } as UpdateAvatarDTO;
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Não foi possível atualizar o avatar.");
        }
    }
    async getAll(filter: Filter): Promise<AccountDTO[]> {
        try {
            const accounts = await accountRepository.getAll(filter);
            return accounts.map(accountMapper);
        } catch (error: any) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Não foi possível listar os usuários.");
        }
    }
    async getById(id: string): Promise<AccountDTO | null> {
        try {
            const account = await accountRepository.getById(id);
            if (!account) throw ThrowError.notFound("Usuário não encontrado.");
            return accountMapper(account);
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Não foi possível listar o usuário.");
        }
    }

    async create(data: CreateAccountDTO): Promise<AccountDTO> {
        try {
            const account = await authRepository.getByEmail(data.email);
            if (account) throw ThrowError.conflict("E-mail já cadastrado.");

            if (data.cpf) {
                const accountByCpf = await accountRepository.getByCpf(data.cpf);
                if (accountByCpf) throw ThrowError.conflict("CPF já cadastrado.");
            }

            if (data.cnpj) {
                const accountByCnpj = await accountRepository.getByCnpj(data.cnpj);
                if (accountByCnpj) throw ThrowError.conflict("CNPJ já cadastrado.");
            }

            data.password = await cryptPassword(data.password);

            const newAccount = await accountRepository.create(data);

            return accountMapper(newAccount);
        } catch (error: any) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Não foi possível criar o usuário.");
        }
    }
    async update(id: string, data: UpdateAccountDTO): Promise<AccountDTO | null> {
        try {
            const updatedAccount = await accountRepository.update(id, data);
            if (!updatedAccount) {
                throw ThrowError.notFound("Usuário não encontrado.");
            }
            return accountMapper(updatedAccount);
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Não foi possível atualizar o usuário.");
        }
    }
    async delete(id: string): Promise<void> {
        try {
            await accountRepository.delete(id);
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Não foi possível deletar o usuário.");
        }
    }



    async addAdoptionAchievement(id: string): Promise<void> {
        try {
            const account = await accountRepository.getById(id);
            if (!account) throw ThrowError.notFound("Usuário não encontrado.");
            const achievements = await achievementsRepository.getByType("adoption");
            await accountAchievementRepository.addAchieviment({ account: id, achievement: achievements?.id } as addAchieviment);
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Erro ao adicionar conquista.");
        }
    }

    async addSponsorshipsAchievement(id: string): Promise<void> {
        try {
            const account = await accountRepository.getById(id);
            if (!account) throw ThrowError.notFound("Usuário não encontrado.");
            const achievements = await achievementsRepository.getByType("sponsorship");
            await accountAchievementRepository.addAchieviment({ account: id, achievement: achievements?.id } as addAchieviment);

        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Erro ao adicionar conquista.");
        }
    }

    async addDonationsAchievement(id: string): Promise<void> {
        try {
            const account = await accountRepository.getById(id);
            if (!account) throw ThrowError.notFound("Usuário não encontrado.");
            const achievements = await achievementsRepository.getByType("donation");
            await accountAchievementRepository.addAchieviment({ account: id, achievement: achievements?.id } as addAchieviment);

        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Erro ao adicionar conquista.");
        }
    }

}