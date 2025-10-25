import { IAccount } from "@models/Account";
import accountMapper from "../../src/Mappers/accountMapper";
import AccountService from '../../src/services/account.services';
import { ThrowError } from '../../src/errors/ThrowError';

// Mock dos repositórios e dependências
jest.mock('../../src/repositories/index', () => ({
  authRepository: {
    getByEmail: jest.fn(),
    getByCpf: jest.fn(),
    getByCnpj: jest.fn(),
    create: jest.fn(),
    getById: jest.fn(),
    changePassword: jest.fn(),
    updateVerificationToken: jest.fn(),
    getTokenVerification: jest.fn()
  },
  accountRepository: {
    getByCpf: jest.fn(),
    getByCnpj: jest.fn(),
    create: jest.fn(),
    getById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    updateAvatar: jest.fn(),
    getAll: jest.fn(),
    search: jest.fn()
  },
  accountAchievementRepository: {
    getByAccountId: jest.fn(),
    addAchieviment: jest.fn()
  },
  achievementRepository: {
    getByType: jest.fn()
  },
  postRepository: {
    getCountPosts: jest.fn()
  },
  accountPetInteractionRepository: {
    getByAccount: jest.fn(),
    create: jest.fn()
  },
  petRepository: {
    getNextAvailable: jest.fn()
  }
}));

jest.mock('../../src/repositories/PictureStorage.repository', () => ({
  PictureStorageRepository: {
    uploadImage: jest.fn(),
    deleteImage: jest.fn()
  }
}));

jest.mock('../../src/utils/aes-crypto', () => ({
  cryptPassword: jest.fn()
}));

// jest.mock('../../src/Mappers/accountMapper', () => ({
//   __esModule: true,
//   default: jest.fn().mockImplementation((account: any) => ({
//     id: account._id,
//     email: account.email,
//     name: account.name,
//     role: account.role
//   }))
// }));

jest.mock('../../src/Mappers/achievementMapper', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation((achievement: any) => ({
    id: achievement.id,
    type: achievement.type
  }))
}));

describe('AccountService', () => {
  const service = new AccountService();

  const {
    authRepository,
    accountRepository,
    accountAchievementRepository,
    postRepository,
    achievementRepository,
    accountPetInteractionRepository,
    petRepository
  } = require('../../src/repositories/index');

  const { PictureStorageRepository } = require('../../src/repositories/PictureStorage.repository');
  const { cryptPassword } = require('../../src/utils/aes-crypto');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const validAccountData = {
      name: "Gabriel",
      email: "lucasmoliquelo49@hotmail.com",
      password: "abcdef",
      cpf: "12345678016",
      phone_number: "3299999999",
      address: {
        street: "Avenida Central",
        number: "456",
        city: "Belo Horizonte",
        cep: "30100-000",
        state: "MG",
        neighborhood: "Vila Loira"
      }
    } as IAccount;

    it.only('deve criar usuário com sucesso quando dados são válidos', async () => {
      // Arrange
      authRepository.getByEmail.mockResolvedValue(null);
      accountRepository.getByCpf.mockResolvedValue(null);
      accountRepository.getByCnpj.mockResolvedValue(null);
      cryptPassword.mockResolvedValue('hashed_password');
      const accountMapped = accountMapper({ _id: 'user123', ...validAccountData, role: 'user' });
      accountRepository.create.mockResolvedValue(accountMapped);

      // Act
      const result = await service.create(validAccountData);

      // Assert
      expect(authRepository.getByEmail).toHaveBeenCalledWith(validAccountData.email);
      expect(accountRepository.getByCpf).toHaveBeenCalledWith(validAccountData.cpf);

      expect(result.password).toBeUndefined();
      expect(accountRepository.create).toHaveBeenCalledWith({
        ...validAccountData
      });
      expect(result).toEqual(accountMapped);
    });

    it('deve falhar quando email já existe', async () => {
      // Arrange
      authRepository.getByEmail.mockResolvedValue({ _id: 'existing_user', email: validAccountData.email });

      // Act & Assert
      await expect(service.create(validAccountData)).rejects.toThrow('E-mail já cadastrado.');
      expect(accountRepository.create).not.toHaveBeenCalled();
    });

    it('deve falhar quando CPF já existe', async () => {
      // Arrange
      authRepository.getByEmail.mockResolvedValue(null);
      accountRepository.getByCpf.mockResolvedValue({ _id: 'existing_user', cpf: validAccountData.cpf });

      // Act & Assert
      await expect(service.create(validAccountData)).rejects.toThrow('CPF já cadastrado.');
      expect(accountRepository.create).not.toHaveBeenCalled();
    });

    it('deve falhar quando CNPJ já existe', async () => {
      // Arrange
      const institutionData = { ...validAccountData, cnpj: '12345678901234', cpf: undefined };
      authRepository.getByEmail.mockResolvedValue(null);
      accountRepository.getByCnpj.mockResolvedValue({ _id: 'existing_institution', cnpj: institutionData.cnpj });

      // Act & Assert
      await expect(service.create(institutionData)).rejects.toThrow('CNPJ já cadastrado.');
      expect(accountRepository.create).not.toHaveBeenCalled();
    });

    it('deve falhar quando criação no banco falha', async () => {
      // Arrange
      authRepository.getByEmail.mockResolvedValue(null);
      accountRepository.getByCpf.mockResolvedValue(null);
      accountRepository.getByCnpj.mockResolvedValue(null);
      cryptPassword.mockResolvedValue('hashed_password');
      accountRepository.create.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.create(validAccountData)).rejects.toThrow('Não foi possível criar o usuário.');
    });
  });

  describe('getById', () => {
    it('deve retornar usuário quando existe', async () => {
      // Arrange
      const userData = { _id: 'user123', email: 'joao@test.com', name: 'João Silva' };
      accountRepository.getById.mockResolvedValue(userData);

      // Act
      const result = await service.getById('user123');

      // Assert
      expect(accountRepository.getById).toHaveBeenCalledWith('user123');
      expect(result).toEqual({
        id: 'user123',
        email: 'joao@test.com',
        name: 'João Silva',
        role: undefined
      });
    });

    it('deve falhar quando usuário não existe', async () => {
      // Arrange
      accountRepository.getById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getById('user123')).rejects.toThrow('Usuário não encontrado.');
    });

    it('deve falhar quando erro interno ocorre', async () => {
      // Arrange
      accountRepository.getById.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.getById('user123')).rejects.toThrow('Não foi possível listar o usuário.');
    });
  });

  describe('update', () => {
    it('deve atualizar usuário com sucesso', async () => {
      // Arrange
      const updateData = { name: 'João Silva Atualizado' };
      const updatedUser = { _id: 'user123', ...updateData };
      accountRepository.update.mockResolvedValue(updatedUser);

      // Act
      const result = await service.update('user123', updateData);

      // Assert
      expect(accountRepository.update).toHaveBeenCalledWith('user123', updateData);
      expect(result).toEqual({
        id: 'user123',
        name: 'João Silva Atualizado',
        email: undefined,
        role: undefined
      });
    });

    it('deve falhar quando usuário não existe', async () => {
      // Arrange
      accountRepository.update.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update('user123', { name: 'Novo Nome' })).rejects.toThrow('Usuário não encontrado.');
    });
  });

  describe('delete', () => {
    it('deve deletar usuário com sucesso', async () => {
      // Arrange
      accountRepository.delete.mockResolvedValue(undefined);

      // Act
      await service.delete('user123');

      // Assert
      expect(accountRepository.delete).toHaveBeenCalledWith('user123');
    });

    it('deve falhar quando erro interno ocorre', async () => {
      // Arrange
      accountRepository.delete.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.delete('user123')).rejects.toThrow('Não foi possível deletar o usuário.');
    });
  });

  describe('updateAvatar', () => {
    it('deve atualizar avatar com sucesso', async () => {
      // Arrange
      const file = { buffer: Buffer.from('image_data') } as Express.Multer.File;
      const userData = { _id: 'user123', avatar: null };
      accountRepository.getById.mockResolvedValue(userData);
      PictureStorageRepository.uploadImage.mockResolvedValue('avatar123');
      accountRepository.updateAvatar.mockResolvedValue(undefined);

      // Act
      const result = await service.updateAvatar('user123', file);

      // Assert
      expect(accountRepository.getById).toHaveBeenCalledWith('user123');
      expect(PictureStorageRepository.uploadImage).toHaveBeenCalledWith(file);
      expect(accountRepository.updateAvatar).toHaveBeenCalledWith('user123', 'avatar123');
      expect(result).toEqual({ avatar: 'avatar123' });
    });

    it('deve deletar avatar antigo antes de atualizar', async () => {
      // Arrange
      const file = { buffer: Buffer.from('image_data') } as Express.Multer.File;
      const userData = { _id: 'user123', avatar: 'old_avatar123' };
      accountRepository.getById.mockResolvedValue(userData);
      PictureStorageRepository.uploadImage.mockResolvedValue('new_avatar123');
      PictureStorageRepository.deleteImage.mockResolvedValue(undefined);
      accountRepository.updateAvatar.mockResolvedValue(undefined);

      // Act
      await service.updateAvatar('user123', file);

      // Assert
      expect(PictureStorageRepository.deleteImage).toHaveBeenCalledWith('old_avatar123');
    });

    it('deve falhar quando arquivo é inválido', async () => {
      // Act & Assert
      await expect(service.updateAvatar('user123', null as any)).rejects.toThrow('Arquivo inválido ou vazio');
    });

    it('deve falhar quando usuário não existe', async () => {
      // Arrange
      const file = { buffer: Buffer.from('image_data') } as Express.Multer.File;
      accountRepository.getById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.updateAvatar('user123', file)).rejects.toThrow('Erro ao atualizar avatar.');
    });

    it('deve falhar quando upload de imagem falha', async () => {
      // Arrange
      const file = { buffer: Buffer.from('image_data') } as Express.Multer.File;
      const userData = { _id: 'user123', avatar: null };
      accountRepository.getById.mockResolvedValue(userData);
      PictureStorageRepository.uploadImage.mockResolvedValue(null);

      // Act & Assert
      await expect(service.updateAvatar('user123', file)).rejects.toThrow('Erro ao atualizar avatar.');
    });
  });

  describe('getStatusByAccount', () => {
    it('deve retornar status do usuário com sucesso', async () => {
      // Arrange
      const postCount = 5;
      const achievements = [
        { achievement: { id: 'ach1', type: 'donation' } },
        { achievement: { id: 'ach2', type: 'adoption' } }
      ];
      postRepository.getCountPosts.mockResolvedValue(postCount);
      accountAchievementRepository.getByAccountId.mockResolvedValue(achievements);

      // Act
      const result = await service.getStatusByAccount('user123');

      // Assert
      expect(postRepository.getCountPosts).toHaveBeenCalledWith('user123');
      expect(accountAchievementRepository.getByAccountId).toHaveBeenCalledWith('user123');
      expect(result).toEqual({
        postCount: 5,
        achievements: [
          { id: 'ach1', type: 'donation' },
          { id: 'ach2', type: 'adoption' }
        ]
      });
    });
  });

  describe('addAdoptionAchievement', () => {
    it('deve adicionar conquista de adoção com sucesso', async () => {
      // Arrange
      const userData = { _id: 'user123' };
      const achievement = { id: 'ach1', type: 'adoption' };
      accountRepository.getById.mockResolvedValue(userData);
      achievementRepository.getByType.mockResolvedValue(achievement);
      accountAchievementRepository.addAchieviment.mockResolvedValue(undefined);

      // Act
      await service.addAdoptionAchievement('user123');

      // Assert
      expect(accountRepository.getById).toHaveBeenCalledWith('user123');
      expect(achievementRepository.getByType).toHaveBeenCalledWith('adoption');
      expect(accountAchievementRepository.addAchieviment).toHaveBeenCalledWith({
        account: 'user123',
        achievement: 'ach1'
      });
    });

    it('deve falhar quando usuário não existe', async () => {
      // Arrange
      accountRepository.getById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.addAdoptionAchievement('user123')).rejects.toThrow('Usuário não encontrado.');
    });
  });

  describe('addSponsorshipsAchievement', () => {
    it('deve adicionar conquista de patrocínio com sucesso', async () => {
      // Arrange
      const userData = { _id: 'user123' };
      const achievement = { id: 'ach1', type: 'sponsorship' };
      accountRepository.getById.mockResolvedValue(userData);
      achievementRepository.getByType.mockResolvedValue(achievement);
      accountAchievementRepository.addAchieviment.mockResolvedValue(undefined);

      // Act
      await service.addSponsorshipsAchievement('user123');

      // Assert
      expect(achievementRepository.getByType).toHaveBeenCalledWith('sponsorship');
    });
  });

  describe('addDonationsAchievement', () => {
    it('deve adicionar conquista de doação com sucesso', async () => {
      // Arrange
      const userData = { _id: 'user123' };
      const achievement = { id: 'ach1', type: 'donation' };
      accountRepository.getById.mockResolvedValue(userData);
      achievementRepository.getByType.mockResolvedValue(achievement);
      accountAchievementRepository.addAchieviment.mockResolvedValue(undefined);

      // Act
      await service.addDonationsAchievement('user123');

      // Assert
      expect(achievementRepository.getByType).toHaveBeenCalledWith('donation');
    });
  });

  describe('getFeed', () => {
    it('deve retornar próximo pet disponível', async () => {
      // Arrange
      const interactions = [{ pet: 'pet1' }, { pet: 'pet2' }];
      const nextPet = { _id: 'pet3', name: 'Rex' };
      accountPetInteractionRepository.getByAccount.mockResolvedValue(interactions);
      petRepository.getNextAvailable.mockResolvedValue(nextPet);
      accountPetInteractionRepository.create.mockResolvedValue(undefined);

      // Mock Types.ObjectId
      const mockObjectId = jest.fn().mockImplementation((id) => ({ toString: () => id }));
      jest.doMock('mongoose', () => ({
        Types: { ObjectId: mockObjectId }
      }));

      // Act
      const result = await service.getFeed('user123', {});

      // Assert
      expect(accountPetInteractionRepository.getByAccount).toHaveBeenCalledWith('user123');
      expect(petRepository.getNextAvailable).toHaveBeenCalled();
      expect(accountPetInteractionRepository.create).toHaveBeenCalledWith({
        status: 'viewed',
        account: 'user123',
        pet: 'pet3'
      });
      expect(result).toEqual([nextPet]);
    });

    it('deve retornar array vazio quando não há pets disponíveis', async () => {
      // Arrange
      accountPetInteractionRepository.getByAccount.mockResolvedValue([]);
      petRepository.getNextAvailable.mockResolvedValue(null);

      // Act
      const result = await service.getFeed('user123', {});

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('getAll', () => {
    it('deve retornar lista de usuários', async () => {
      // Arrange
      const users = [
        { _id: 'user1', name: 'João', email: 'joao@test.com' },
        { _id: 'user2', name: 'Maria', email: 'maria@test.com' }
      ];
      accountRepository.getAll.mockResolvedValue(users);

      // Act
      const result = await service.getAll({});

      // Assert
      expect(accountRepository.getAll).toHaveBeenCalledWith({});
      expect(result).toHaveLength(2);
    });
  });

  describe('search', () => {
    it('deve buscar usuários com filtros', async () => {
      // Arrange
      const filter = { name: 'João' };
      const users = [{ _id: 'user1', name: 'João Silva' }];
      accountRepository.search.mockResolvedValue(users);

      // Act
      const result = await service.search(filter);

      // Assert
      expect(accountRepository.search).toHaveBeenCalledWith(filter);
      expect(result).toEqual(users);
    });
  });
});
