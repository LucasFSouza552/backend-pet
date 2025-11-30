import { IAccount } from "../../src/models/Account";
import AccountService from '../../src/services/account.services';
import { ObjectId } from "mongodb";

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
    addAchievement: jest.fn(),
    existsByAccountAndAchievement: jest.fn()
  },
  achievementRepository: {
    getByType: jest.fn()
  },
  accountPetInteractionRepository: {
    getByAccount: jest.fn(),
    create: jest.fn()
  },
  petRepository: {
    getNextAvailable: jest.fn()
  }
}));

jest.mock('../../src/config/gridfs', () => ({
  gfs: null
}));

jest.mock('../../src/repositories/pictureStorage.repository', () => ({
  PictureStorageRepository: {
    uploadImage: jest.fn(),
    deleteImage: jest.fn()
  }
}));

jest.mock('../../src/utils/aes-crypto', () => ({
  cryptPassword: jest.fn()
}));

jest.mock('../../src/Mappers/accountMapper', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation((account) => ({
    id: account._id,
    email: account.email,
    name: account.name,
    role: account.role
  }))
}));

jest.mock('../../src/Mappers/achievementMapper', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation((achievement) => ({
    id: achievement.id,
    type: achievement.type
  }))
}));

jest.mock('../../src/Mappers/petMapper', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation((pet) => ({
    id: pet._id?.toString() || pet.id,
    name: pet.name,
    adopted: pet.adopted
  }))
}));

describe('AccountService', () => {
  let service: AccountService;
  
  const {
    authRepository,
    accountRepository,
    accountAchievementRepository,
    achievementRepository,
    accountPetInteractionRepository,
    petRepository
  } = require('../../src/repositories/index');

  const { PictureStorageRepository } = require('../../src/repositories/pictureStorage.repository');
  const crypt = require('../../src/utils/aes-crypto');

  const createValidAccountData = (overrides?: Partial<IAccount>): IAccount => ({
    name: "João Silva",
    email: "joao@test.com",
    password: "senha123",
    cpf: "12345678901",
    phone_number: "3299999999",
    address: {
      street: "Avenida Central",
      number: "456",
      city: "Belo Horizonte",
      cep: "30100-000",
      state: "MG",
      neighborhood: "Vila Loira"
    },
    ...overrides
  } as IAccount);

  const createMockAccount = (overrides?: any) => ({
    _id: 'user123',
    email: 'joao@test.com',
    name: 'João Silva',
    role: 'user',
    ...overrides
  });

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    service = new AccountService();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('create', () => {
    const buildValidAccountData = (overrides?: Partial<IAccount>) => createValidAccountData(overrides);

    it('deve criar usuário com sucesso quando dados são válidos', async () => {
      const validAccountData = buildValidAccountData();
      const originalPassword = validAccountData.password;
      const mockAccount = createMockAccount(validAccountData);
      authRepository.getByEmail.mockResolvedValue(null);
      accountRepository.getByCpf.mockResolvedValue(null);
      accountRepository.getByCnpj.mockResolvedValue(null);
      crypt.cryptPassword.mockResolvedValue('hashed_password');
      accountRepository.create.mockResolvedValue(mockAccount);

      const result = await service.create(validAccountData);

      expect(result).toHaveProperty('id');
      expect(result.password).toBeUndefined();
      expect(authRepository.getByEmail).toHaveBeenCalledWith(validAccountData.email);
      expect(accountRepository.getByCpf).toHaveBeenCalledWith(validAccountData.cpf);
      expect(crypt.cryptPassword).toHaveBeenCalledWith(originalPassword);
      expect(accountRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: validAccountData.email,
          name: validAccountData.name,
          password: 'hashed_password'
        })
      );
    });

    it('deve criar instituição com CNPJ quando dados são válidos', async () => {
      const institutionData = buildValidAccountData({
        cnpj: '12345678901234',
        cpf: undefined
      });
      const mockInstitution = createMockAccount({ ...institutionData, role: 'institution' });
      authRepository.getByEmail.mockResolvedValue(null);
      accountRepository.getByCnpj.mockResolvedValue(null);
      crypt.cryptPassword.mockResolvedValue('hashed_password');
      accountRepository.create.mockResolvedValue(mockInstitution);

      const result = await service.create(institutionData);

      expect(result).toHaveProperty('id');
      expect(accountRepository.getByCnpj).toHaveBeenCalledWith(institutionData.cnpj);
      expect(accountRepository.getByCpf).not.toHaveBeenCalled();
    });

    it('deve falhar quando email já existe', async () => {
      const validAccountData = buildValidAccountData();
      authRepository.getByEmail.mockResolvedValue(createMockAccount());

      await expect(service.create(validAccountData)).rejects.toThrow('E-mail já cadastrado.');
      expect(accountRepository.create).not.toHaveBeenCalled();
    });

    it('deve falhar quando CPF já existe', async () => {
      const validAccountData = buildValidAccountData();
      authRepository.getByEmail.mockResolvedValue(null);
      accountRepository.getByCpf.mockResolvedValue(createMockAccount());

      await expect(service.create(validAccountData)).rejects.toThrow('CPF já cadastrado.');
      expect(accountRepository.create).not.toHaveBeenCalled();
    });

    it('deve falhar quando CNPJ já existe', async () => {
      const institutionData = buildValidAccountData({ cnpj: '12345678901234', cpf: undefined });
      authRepository.getByEmail.mockResolvedValue(null);
      accountRepository.getByCnpj.mockResolvedValue(createMockAccount());

      await expect(service.create(institutionData)).rejects.toThrow('CNPJ já cadastrado.');
      expect(accountRepository.create).not.toHaveBeenCalled();
    });

    it('deve falhar quando criação no banco falha', async () => {
      const validAccountData = buildValidAccountData();
      authRepository.getByEmail.mockResolvedValue(null);
      accountRepository.getByCpf.mockResolvedValue(null);
      accountRepository.getByCnpj.mockResolvedValue(null);
      crypt.cryptPassword.mockResolvedValue('hashed_password');
      accountRepository.create.mockRejectedValue(new Error('Database error'));

      await expect(service.create(validAccountData)).rejects.toThrow('Não foi possível criar o usuário.');
    });

    it('deve falhar quando criptografia de senha falha', async () => {
      const validAccountData = buildValidAccountData();
      authRepository.getByEmail.mockResolvedValue(null);
      accountRepository.getByCpf.mockResolvedValue(null);
      crypt.cryptPassword.mockRejectedValue(new Error('Crypto error'));

      await expect(service.create(validAccountData)).rejects.toThrow('Não foi possível criar o usuário.');
    });
  });

  describe('getById', () => {
    it('deve retornar usuário quando existe', async () => {
      const mockAccount = createMockAccount();
      accountRepository.getById.mockResolvedValue(mockAccount);

      const result = await service.getById('user123');

      expect(accountRepository.getById).toHaveBeenCalledWith('user123');
      expect(result).toEqual({
        id: 'user123',
        email: 'joao@test.com',
        name: 'João Silva',
        role: 'user'
      });
    });

    it('deve falhar quando usuário não existe', async () => {
      accountRepository.getById.mockResolvedValue(null);

      await expect(service.getById('user123')).rejects.toThrow('Usuário não encontrado.');
      expect(accountRepository.getById).toHaveBeenCalledWith('user123');
    });

    it('deve falhar quando erro interno ocorre', async () => {
      accountRepository.getById.mockRejectedValue(new Error('Database error'));

      await expect(service.getById('user123')).rejects.toThrow('Não foi possível listar o usuário.');
    });
  });

  describe('update', () => {
    it('deve atualizar usuário com sucesso', async () => {
      const updateData = { name: 'João Silva Atualizado' };
      const updatedUser = createMockAccount(updateData);
      accountRepository.update.mockResolvedValue(updatedUser);

      const result = await service.update('user123', updateData);

      expect(accountRepository.update).toHaveBeenCalledWith('user123', updateData);
      expect(result).toEqual({
        id: 'user123',
        name: 'João Silva Atualizado',
        email: 'joao@test.com',
        role: 'user'
      });
    });

    it('deve falhar quando usuário não existe', async () => {
      accountRepository.update.mockResolvedValue(null);

      await expect(service.update('user123', { name: 'Novo Nome' })).rejects.toThrow('Usuário não encontrado.');
    });

    it('deve falhar quando erro interno ocorre', async () => {
      accountRepository.update.mockRejectedValue(new Error('Database error'));

      await expect(service.update('user123', { name: 'Novo Nome' })).rejects.toThrow('Não foi possível atualizar o usuário.');
    });
  });

  describe('delete', () => {
    it('deve deletar usuário com sucesso', async () => {
      accountRepository.delete.mockResolvedValue(undefined);

      await service.delete('user123');

      expect(accountRepository.delete).toHaveBeenCalledWith('user123');
    });

    it('deve falhar quando erro interno ocorre', async () => {
      accountRepository.delete.mockRejectedValue(new Error('Database error'));

      await expect(service.delete('user123')).rejects.toThrow('Não foi possível deletar o usuário.');
    });
  });

  describe('updateAvatar', () => {
    const createMockFile = (): Express.Multer.File => ({
      buffer: Buffer.from('image_data'),
      fieldname: 'avatar',
      originalname: 'avatar.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 1024,
      destination: '',
      filename: '',
      path: '',
      stream: null as any
    });

    it('deve atualizar avatar com sucesso', async () => {
      const file = createMockFile();
      const userData = createMockAccount({ avatar: null });
      const avatarId = 'avatar123';
      accountRepository.getById.mockResolvedValue(userData);
      PictureStorageRepository.uploadImage.mockResolvedValue(avatarId);
      accountRepository.updateAvatar.mockResolvedValue(undefined);

      const result = await service.updateAvatar('user123', file);

      expect(accountRepository.getById).toHaveBeenCalledWith('user123');
      expect(PictureStorageRepository.uploadImage).toHaveBeenCalledWith(file);
      expect(accountRepository.updateAvatar).toHaveBeenCalledWith('user123', avatarId);
      expect(result).toEqual({ avatar: avatarId });
    });

    it('deve deletar avatar antigo antes de atualizar', async () => {
      const file = createMockFile();
      const oldAvatarId = 'old_avatar123';
      const newAvatarId = 'new_avatar123';
      const userData = createMockAccount({ avatar: oldAvatarId });
      accountRepository.getById.mockResolvedValue(userData);
      PictureStorageRepository.uploadImage.mockResolvedValue(newAvatarId);
      PictureStorageRepository.deleteImage.mockResolvedValue(undefined);
      accountRepository.updateAvatar.mockResolvedValue(undefined);

      await service.updateAvatar('user123', file);

      expect(PictureStorageRepository.deleteImage).toHaveBeenCalledWith(oldAvatarId);
      expect(PictureStorageRepository.uploadImage).toHaveBeenCalledWith(file);
      expect(accountRepository.updateAvatar).toHaveBeenCalledWith('user123', newAvatarId);
    });

    it('deve falhar quando arquivo é inválido', async () => {
      await expect(service.updateAvatar('user123', null as any)).rejects.toThrow('Arquivo inválido ou vazio');
      expect(accountRepository.getById).not.toHaveBeenCalled();
    });

    it('deve falhar quando arquivo não tem buffer', async () => {
      const file = { ...createMockFile(), buffer: null } as any;

      await expect(service.updateAvatar('user123', file)).rejects.toThrow('Arquivo inválido ou vazio');
    });

    it('deve falhar quando usuário não existe', async () => {
      const file = createMockFile();
      accountRepository.getById.mockResolvedValue(null);

      await expect(service.updateAvatar('user123', file)).rejects.toThrow('Erro ao atualizar avatar.');
    });

    it('deve falhar quando upload de imagem falha', async () => {
      const file = createMockFile();
      const userData = createMockAccount({ avatar: null });
      accountRepository.getById.mockResolvedValue(userData);
      PictureStorageRepository.uploadImage.mockResolvedValue(null);

      await expect(service.updateAvatar('user123', file)).rejects.toThrow('Erro ao atualizar avatar.');
    }, 10000);

    it('deve falhar quando erro interno ocorre', async () => {
      const file = createMockFile();
      accountRepository.getById.mockRejectedValue(new Error('Database error'));

      await expect(service.updateAvatar('user123', file)).rejects.toThrow('Não foi possível atualizar o avatar.');
    });
  });

  describe('getStatusByAccount', () => {
    it('deve retornar status do usuário com conquistas com sucesso', async () => {
      const achievements = [
        { achievement: { id: 'ach1', type: 'donation' } },
        { achievement: { id: 'ach2', type: 'adoption' } }
      ];
      accountAchievementRepository.getByAccountId.mockResolvedValue(achievements);

      const result = await service.getStatusByAccount('user123');

      expect(accountAchievementRepository.getByAccountId).toHaveBeenCalledWith('user123');
      expect(result).toEqual({
        achievements: [
          { id: 'ach1', type: 'donation' },
          { id: 'ach2', type: 'adoption' }
        ]
      });
    });

    it('deve retornar array vazio quando não há conquistas', async () => {
      accountAchievementRepository.getByAccountId.mockResolvedValue([]);

      const result = await service.getStatusByAccount('user123');

      expect(result).toEqual({ achievements: [] });
    });

    it('deve falhar quando erro interno ocorre', async () => {
      accountAchievementRepository.getByAccountId.mockRejectedValue(new Error('Database error'));

      await expect(service.getStatusByAccount('user123')).rejects.toThrow('Erro ao buscar status.');
    });
  });

  describe('addAdoptionAchievement', () => {
    it('deve adicionar conquista de adoção com sucesso', async () => {
      const userData = createMockAccount();
      const achievement = { id: 'ach1', type: 'adoption' };
      accountRepository.getById.mockResolvedValue(userData);
      achievementRepository.getByType.mockResolvedValue(achievement);
      accountAchievementRepository.addAchievement.mockResolvedValue(undefined);

      await service.addAdoptionAchievement('user123');

      expect(accountRepository.getById).toHaveBeenCalledWith('user123');
      expect(achievementRepository.getByType).toHaveBeenCalledWith('adoption');
      expect(accountAchievementRepository.addAchievement).toHaveBeenCalledWith({
        account: 'user123',
        achievement: 'ach1'
      });
    });

    it('deve falhar quando usuário não existe', async () => {
      accountRepository.getById.mockResolvedValue(null);

      await expect(service.addAdoptionAchievement('user123')).rejects.toThrow('Usuário não encontrado.');
    });

    it('deve falhar quando erro interno ocorre', async () => {
      accountRepository.getById.mockRejectedValue(new Error('Database error'));

      await expect(service.addAdoptionAchievement('user123')).rejects.toThrow('Erro ao adicionar conquista.');
    });
  });

  describe('addSponsorshipsAchievement', () => {
    it('deve adicionar conquista de patrocínio com sucesso', async () => {
      const userData = createMockAccount();
      const achievement = { id: 'ach1', type: 'sponsorship' };
      accountRepository.getById.mockResolvedValue(userData);
      achievementRepository.getByType.mockResolvedValue(achievement);
      accountAchievementRepository.addAchievement.mockResolvedValue(undefined);

      await service.addSponsorshipsAchievement('user123');

      expect(accountRepository.getById).toHaveBeenCalledWith('user123');
      expect(achievementRepository.getByType).toHaveBeenCalledWith('sponsorship');
      expect(accountAchievementRepository.addAchievement).toHaveBeenCalledWith({
        account: 'user123',
        achievement: 'ach1'
      });
    });

    it('deve falhar quando usuário não existe', async () => {
      accountRepository.getById.mockResolvedValue(null);

      await expect(service.addSponsorshipsAchievement('user123')).rejects.toThrow('Usuário não encontrado.');
    });
  });

  describe('addDonationsAchievement', () => {
    it('deve adicionar conquista de doação com sucesso', async () => {
      const userData = createMockAccount();
      const achievement = { id: 'ach1', type: 'donation' };
    
      accountRepository.getById.mockResolvedValue(userData);
      achievementRepository.getByType.mockResolvedValue(achievement);
    
      accountAchievementRepository.existsByAccountAndAchievement.mockResolvedValue(false);
    
      accountAchievementRepository.addAchievement.mockResolvedValue(undefined);
    
      await service.addDonationsAchievement('user123');
    
      expect(accountRepository.getById).toHaveBeenCalledWith('user123');
      expect(achievementRepository.getByType).toHaveBeenCalledWith('donation');
      expect(accountAchievementRepository.addAchievement).toHaveBeenCalledWith({
        account: 'user123',
        achievement: 'ach1'
      });
    });
    

    it('deve falhar quando usuário não existe', async () => {
      accountRepository.getById.mockResolvedValue(null);

      await expect(service.addDonationsAchievement('user123')).rejects.toThrow('Usuário não encontrado.');
    });
  });

  describe('getFeed', () => {
    it('deve retornar próximo pet disponível quando há pets não vistos', async () => {
      const interactions = [
        { pet: new ObjectId().toHexString(), status: 'viewed' },
        { pet: new ObjectId().toHexString(), status: 'viewed' }
      ];
      const petId = new ObjectId();
      const nextPet = { _id: petId, id: petId.toString(), name: 'Rex', adopted: false };
      const accountId = new ObjectId().toHexString();

      accountPetInteractionRepository.getByAccount.mockResolvedValue(interactions);
      petRepository.getNextAvailable.mockResolvedValue(nextPet);
      accountPetInteractionRepository.create.mockResolvedValue(undefined);

      const result = await service.getFeed(accountId);

      expect(accountPetInteractionRepository.getByAccount).toHaveBeenCalledWith(accountId);
      expect(petRepository.getNextAvailable).toHaveBeenCalled();
      expect(accountPetInteractionRepository.create).toHaveBeenCalled();
      expect(result).toBeTruthy();
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name', 'Rex');
      expect(result).toHaveProperty('adopted', false);
    });

    it('deve retornar null quando não há pets disponíveis', async () => {
      accountPetInteractionRepository.getByAccount.mockResolvedValue([]);
      petRepository.getNextAvailable.mockResolvedValue(null);

      const result = await service.getFeed('user123');

      expect(result).toBeNull();
      expect(accountPetInteractionRepository.create).not.toHaveBeenCalled();
    });

    it('deve retornar null quando todos os pets já foram vistos', async () => {
      const interactions = [
        { pet: new ObjectId().toHexString(), status: 'viewed' }
      ];
      accountPetInteractionRepository.getByAccount.mockResolvedValue(interactions);
      petRepository.getNextAvailable.mockResolvedValue(null);

      const result = await service.getFeed('user123');

      expect(result).toBeNull();
    });

    it('deve falhar quando erro interno ocorre', async () => {
      accountPetInteractionRepository.getByAccount.mockRejectedValue(new Error('Database error'));

      await expect(service.getFeed('user123')).rejects.toThrow('Erro ao buscar o feed.');
    });
  });

  describe('getAll', () => {
    it('deve retornar lista de usuários com sucesso', async () => {
      const users = [
        createMockAccount({ _id: 'user1', name: 'João' }),
        createMockAccount({ _id: 'user2', name: 'Maria' })
      ];
      accountRepository.getAll.mockResolvedValue(users);

      const result = await service.getAll({});

      expect(accountRepository.getAll).toHaveBeenCalledWith({});
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('id');
    });

    it('deve retornar lista vazia quando não há usuários', async () => {
      accountRepository.getAll.mockResolvedValue([]);

      const result = await service.getAll({});

      expect(result).toEqual([]);
    });

    it('deve falhar quando erro interno ocorre', async () => {
      accountRepository.getAll.mockRejectedValue(new Error('Database error'));

      await expect(service.getAll({})).rejects.toThrow('Não foi possível listar os usuários.');
    });
  });

  describe('search', () => {
    it('deve buscar usuários com filtros com sucesso', async () => {
      const filter = { name: 'João' };
      const users = [createMockAccount({ name: 'João Silva' })];
      accountRepository.search.mockResolvedValue(users);

      const result = await service.search(filter);

      expect(accountRepository.search).toHaveBeenCalledWith(filter);
      expect(result).toEqual(users);
    });

    it('deve retornar array vazio quando não encontra resultados', async () => {
      const filter = { name: 'Inexistente' };
      accountRepository.search.mockResolvedValue([]);

      const result = await service.search(filter);

      expect(result).toEqual([]);
    });

    it('deve falhar quando erro interno ocorre', async () => {
      accountRepository.search.mockRejectedValue(new Error('Database error'));

      await expect(service.search({ name: 'João' })).rejects.toThrow('Erro ao buscar usuários.');
    });
  });
});
