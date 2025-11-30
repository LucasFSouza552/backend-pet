import PetService from '../../src/services/pet.services';
import { ThrowError } from '../../src/errors/ThrowError';
import { ObjectId } from 'mongodb';

// Mock dos repositórios e dependências
jest.mock('../../src/repositories/index', () => ({
  historyRepository: {
    create: jest.fn(),
    getById: jest.fn(),
    update: jest.fn(),
    getRequestedAdoption: jest.fn(),
    getByAccountAndPet: jest.fn(),
    getPendingByAccountAndPet: jest.fn(),
    getByPetId: jest.fn()
  },
  petRepository: {
    getById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    getAll: jest.fn(),
    create: jest.fn(),
    getAdoptionsByAccount: jest.fn(),
    softDelete: jest.fn()
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

jest.mock('../../src/services/index', () => ({
  accountService: {
    getById: jest.fn(),
    addAdoptionAchievement: jest.fn()
  },
  accountPetInteractionService: {
    create: jest.fn(),
    getPetInteractionByAccount: jest.fn(),
    updateStatus: jest.fn()
  }
}));

describe('PetService', () => {
  let service: PetService;

  const { historyRepository, petRepository } = require('../../src/repositories/index');
  const { PictureStorageRepository } = require('../../src/repositories/pictureStorage.repository');
  const { accountService, accountPetInteractionService } = require('../../src/services/index');

  // Factory functions para dados de teste
  const createMockPet = (overrides?: any) => ({
    _id: new ObjectId(),
    id: new ObjectId().toString(),
    name: 'Rex',
    type: 'Cachorro',
    gender: 'M',
    weight: 10,
    account: new ObjectId().toString(),
    adopted: false,
    images: [],
    ...overrides
  });

  const createMockAccount = (overrides?: any) => ({
    id: 'user123',
    email: 'joao@test.com',
    name: 'João Silva',
    ...overrides
  });

  const createMockFile = (): Express.Multer.File => ({
    buffer: Buffer.from('image_data'),
    fieldname: 'image',
    originalname: 'image.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 1024,
    destination: '',
    filename: '',
    path: '',
    stream: null as any
  });

  beforeEach(() => {
    service = new PetService();
    jest.clearAllMocks();
  });

  describe('updatePetImages', () => {
    it('deve atualizar imagens do pet com sucesso', async () => {
      // Arrange
      const imageId1 = new ObjectId();
      const imageId2 = new ObjectId();
      const petData = createMockPet({ images: [] });
      const files = [createMockFile(), createMockFile()];
      petRepository.getById.mockResolvedValue(petData);
      PictureStorageRepository.uploadImage
        .mockResolvedValueOnce(imageId1)
        .mockResolvedValueOnce(imageId2);
      petRepository.update.mockResolvedValue(undefined);

      // Act
      const result = await service.updatePetImages('pet123', files);

      // Assert
      expect(petRepository.getById).toHaveBeenCalledWith('pet123');
      expect(PictureStorageRepository.uploadImage).toHaveBeenCalledTimes(2);
      expect(petRepository.update).toHaveBeenCalledWith('pet123', { images: [imageId1, imageId2] });
      expect(result).toHaveLength(2);
    }, 10000);

    it('deve substituir imagens existentes pelas novas', async () => {
      // Arrange
      const existingImageId = new ObjectId();
      const petData = createMockPet({ images: [existingImageId] });
      const files = [createMockFile()];
      const newImageId = new ObjectId();
      petRepository.getById.mockResolvedValue(petData);
      PictureStorageRepository.deleteImage.mockResolvedValue(undefined);
      PictureStorageRepository.uploadImage.mockResolvedValue(newImageId);
      petRepository.update.mockResolvedValue(undefined);

      // Act
      const result = await service.updatePetImages('pet123', files);

      // Assert
      // O serviço deleta todas as imagens existentes e adiciona apenas as novas
      expect(PictureStorageRepository.deleteImage).toHaveBeenCalledWith(existingImageId);
      expect(result).toEqual([newImageId]);
      expect(result).not.toContainEqual(existingImageId);
    }, 10000);

    it('deve falhar quando limite de imagens é atingido', async () => {
      // Arrange
      const petData = createMockPet({ images: [] });
      // O serviço verifica se files.length > 5, não o total de imagens
      const files = Array(6).fill(null).map(() => createMockFile());
      petRepository.getById.mockResolvedValue(petData);

      // Act & Assert
      await expect(service.updatePetImages('pet123', files)).rejects.toThrow('Limite de imagens atingido.');
    });

    it('deve ignorar arquivos sem buffer', async () => {
      // Arrange
      const petData = createMockPet();
      const files = [
        createMockFile(),
        { ...createMockFile(), buffer: null } as any
      ];
      const imageId = new ObjectId();
      petRepository.getById.mockResolvedValue(petData);
      PictureStorageRepository.uploadImage.mockResolvedValue(imageId);
      petRepository.update.mockResolvedValue(undefined);

      // Act
      const result = await service.updatePetImages('pet123', files);

      // Assert
      expect(PictureStorageRepository.uploadImage).toHaveBeenCalledTimes(1);
      expect(result).toContainEqual(imageId);
    }, 10000);

    it('deve falhar quando pet não existe', async () => {
      // Arrange
      petRepository.getById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.updatePetImages('pet123', [])).rejects.toThrow('Pet não encontrado.');
    });

    it('deve falhar quando erro interno ocorre', async () => {
      // Arrange
      petRepository.getById.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.updatePetImages('pet123', [])).rejects.toThrow('Erro ao atualizar avatar.');
    });
  });

  describe('deletePetImage', () => {
    it('deve deletar imagem do pet com sucesso', async () => {
      // Arrange
      const ownerId = 'owner123';
      const imageId = new ObjectId().toHexString();
      const imageId2 = new ObjectId().toHexString();
      const petData = createMockPet({ 
        images: [imageId, imageId2],
        account: ownerId
      });
      petRepository.getById.mockResolvedValue(petData);
      PictureStorageRepository.deleteImage.mockResolvedValue(undefined);
      petRepository.update.mockResolvedValue(undefined);

      // Act
      await service.deletePetImage('pet123', imageId, ownerId);

      // Assert
      expect(PictureStorageRepository.deleteImage).toHaveBeenCalledWith(imageId);
      expect(petRepository.update).toHaveBeenCalledWith('pet123', {
        images: [imageId2]
      });
    });

    it('deve falhar quando pet não existe', async () => {
      // Arrange
      petRepository.getById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.deletePetImage('pet123', 'image1', 'owner123')).rejects.toThrow('Pet não encontrado.');
    });

    it('deve falhar quando pet não tem imagens', async () => {
      // Arrange
      const petData = createMockPet({ images: null });
      petRepository.getById.mockResolvedValue(petData);

      // Act & Assert
      await expect(service.deletePetImage('pet123', 'image1', 'owner123')).rejects.toThrow('Imagem não encontrada.');
    });

    it('deve falhar quando erro interno ocorre', async () => {
      // Arrange
      petRepository.getById.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.deletePetImage('pet123', 'image1', 'owner123')).rejects.toThrow('Erro ao deletar imagem.');
    });
  });

  describe('likePet', () => {
    it('deve criar solicitação de adoção com sucesso', async () => {
      // Arrange
      const accountData = createMockAccount();
      const petData = createMockPet({ account: 'owner123' });
      const historyData = { id: 'history123' };
      accountService.getById.mockResolvedValue(accountData);
      petRepository.getById.mockResolvedValue(petData);
      historyRepository.create.mockResolvedValue(historyData);
      accountPetInteractionService.getPetInteractionByAccount.mockResolvedValue(null); // Não existe interação
      accountPetInteractionService.create.mockResolvedValue({});

      // Act
      const result = await service.likePet('pet123', 'user123');

      // Assert
      expect(accountService.getById).toHaveBeenCalledWith('user123');
      expect(petRepository.getById).toHaveBeenCalledWith('pet123');
      expect(historyRepository.create).toHaveBeenCalledWith({
        type: 'adoption',
        pet: petData.id,
        account: accountData.id,
        institution: petData.account,
        status: 'pending'
      });
      expect(accountPetInteractionService.getPetInteractionByAccount).toHaveBeenCalledWith(accountData.id, petData.id);
      expect(accountPetInteractionService.create).toHaveBeenCalled();
      expect(result).toEqual(historyData);
    });

    it('deve falhar quando usuário não existe', async () => {
      // Arrange
      accountService.getById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.likePet('pet123', 'user123')).rejects.toThrow('Usuário não encontrado.');
    });

    it('deve falhar quando pet não existe', async () => {
      // Arrange
      const accountData = createMockAccount();
      accountService.getById.mockResolvedValue(accountData);
      petRepository.getById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.likePet('pet123', 'user123')).rejects.toThrow('Pet não encontrado.');
    });

    it('deve falhar quando pet já foi adotado', async () => {
      // Arrange
      const accountData = createMockAccount();
      const petData = createMockPet({ adopted: true });
      accountService.getById.mockResolvedValue(accountData);
      petRepository.getById.mockResolvedValue(petData);

      // Act & Assert
      await expect(service.likePet('pet123', 'user123')).rejects.toThrow('Pet já foi adotado.');
    });

    it('deve falhar quando usuário é proprietário do pet', async () => {
      // Arrange
      const accountData = createMockAccount();
      const petData = createMockPet({ account: 'user123' });
      accountService.getById.mockResolvedValue(accountData);
      petRepository.getById.mockResolvedValue(petData);

      // Act & Assert
      await expect(service.likePet('pet123', 'user123')).rejects.toThrow('Usuário proprietário.');
    });

    it('deve falhar quando criação de histórico falha', async () => {
      // Arrange
      const accountData = createMockAccount();
      const petData = createMockPet({ account: 'owner123' });
      accountService.getById.mockResolvedValue(accountData);
      petRepository.getById.mockResolvedValue(petData);
      historyRepository.create.mockResolvedValue(null);

      // Act & Assert
      await expect(service.likePet('pet123', 'user123')).rejects.toThrow('Erro ao solicitar adotação.');
    });
  });

  describe('dislikePet', () => {
    it('deve criar interação de dislike com sucesso', async () => {
      // Arrange
      const accountData = createMockAccount();
      const petData = createMockPet({ account: 'owner123' });
      accountService.getById.mockResolvedValue(accountData);
      petRepository.getById.mockResolvedValue(petData);
      accountPetInteractionService.getPetInteractionByAccount.mockResolvedValue(null); // Não existe interação
      accountPetInteractionService.create.mockResolvedValue({});

      // Act
      await service.dislikePet('pet123', 'user123');

      // Assert
      expect(accountService.getById).toHaveBeenCalledWith('user123');
      expect(petRepository.getById).toHaveBeenCalledWith('pet123');
      expect(accountPetInteractionService.getPetInteractionByAccount).toHaveBeenCalledWith(accountData.id, petData.id);
      expect(accountPetInteractionService.create).toHaveBeenCalledWith({
        account: accountData.id,
        pet: petData.id,
        status: 'disliked'
      });
    });

    it('deve falhar quando usuário é proprietário', async () => {
      // Arrange
      const accountData = createMockAccount();
      const petData = createMockPet({ account: 'user123' });
      accountService.getById.mockResolvedValue(accountData);
      petRepository.getById.mockResolvedValue(petData);

      // Act & Assert
      await expect(service.dislikePet('pet123', 'user123')).rejects.toThrow('Usuário proprietário.');
    });
  });

  describe('acceptRequestedAdoption', () => {
    it('deve aceitar solicitação de adoção com sucesso', async () => {
      // Arrange
      const petData = createMockPet({ account: 'institution123' });
      const historyData = { id: 'history123', status: 'pending' };
      const otherHistory = { id: 'history456', status: 'pending' };
      petRepository.getById.mockResolvedValue(petData);
      historyRepository.getPendingByAccountAndPet.mockResolvedValue(historyData);
      historyRepository.getByPetId.mockResolvedValue([historyData, otherHistory]);
      historyRepository.update.mockResolvedValue(undefined);
      petRepository.update.mockResolvedValue(petData);
      accountService.addAdoptionAchievement.mockResolvedValue(undefined);

      // Act
      const result = await service.acceptRequestedAdoption('pet123', 'user123', 'institution123');

      // Assert
      expect(historyRepository.getPendingByAccountAndPet).toHaveBeenCalledWith('user123', 'pet123');
      expect(historyRepository.update).toHaveBeenCalledWith(historyData.id, { status: 'completed' });
      expect(historyRepository.update).toHaveBeenCalledWith(otherHistory.id, { status: 'cancelled' });
      expect(petRepository.update).toHaveBeenCalledWith('pet123', { adopted: true, account: 'user123' });
      expect(accountService.addAdoptionAchievement).toHaveBeenCalledWith('user123');
      expect(result).toEqual(petData);
    });

    it('deve falhar quando pet não existe', async () => {
      // Arrange
      petRepository.getById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.acceptRequestedAdoption('pet123', 'user123', 'institution123'))
        .rejects.toThrow('Pet não encontrado.');
    });

    it('deve falhar quando pet já foi adotado', async () => {
      // Arrange
      const petData = createMockPet({ adopted: true });
      petRepository.getById.mockResolvedValue(petData);

      // Act & Assert
      await expect(service.acceptRequestedAdoption('pet123', 'user123', 'institution123'))
        .rejects.toThrow('Pet já foi adotado.');
    });

    it('deve falhar quando instituição não é proprietária', async () => {
      // Arrange
      const petData = createMockPet({ account: 'other123' });
      petRepository.getById.mockResolvedValue(petData);

      // Act & Assert
      await expect(service.acceptRequestedAdoption('pet123', 'user123', 'institution123'))
        .rejects.toThrow('Somente a instituição pode aceitar adotação.');
    });
  });

  describe('rejectRequestedAdoption', () => {
    it('deve rejeitar solicitação de adoção com sucesso', async () => {
      // Arrange
      const petData = createMockPet({ account: 'institution123' });
      const historyData = { id: 'history123', status: 'pending' };
      petRepository.getById.mockResolvedValue(petData);
      historyRepository.getByAccountAndPet.mockResolvedValue(historyData);
      historyRepository.update.mockResolvedValue(undefined);

      // Act
      await service.rejectRequestedAdoption('pet123', 'user123', 'institution123');

      // Assert
      expect(historyRepository.update).toHaveBeenCalledWith(historyData.id, { status: 'cancelled' });
    });

    it('deve falhar quando histórico não existe', async () => {
      // Arrange
      const petData = createMockPet({ account: 'institution123' });
      petRepository.getById.mockResolvedValue(petData);
      historyRepository.getByAccountAndPet.mockResolvedValue(null);

      // Act & Assert
      await expect(service.rejectRequestedAdoption('pet123', 'user123', 'institution123'))
        .rejects.toThrow('Histórico não encontrado.');
    });
  });

  describe('getAll', () => {
    it('deve retornar lista de pets com sucesso', async () => {
      // Arrange
      const pets = [createMockPet(), createMockPet({ name: 'Mimi' })];
      petRepository.getAll.mockResolvedValue(pets);

      // Act
      const result = await service.getAll({});

      // Assert
      expect(petRepository.getAll).toHaveBeenCalledWith({});
      expect(result).toEqual(pets);
    });

    it('deve falhar quando erro interno ocorre', async () => {
      // Arrange
      petRepository.getAll.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.getAll({})).rejects.toThrow('Erro ao buscar os pets.');
    });
  });

  describe('getById', () => {
    it('deve retornar pet quando existe', async () => {
      // Arrange
      const petData = createMockPet();
      petRepository.getById.mockResolvedValue(petData);

      // Act
      const result = await service.getById('pet123');

      // Assert
      expect(petRepository.getById).toHaveBeenCalledWith('pet123');
      expect(result).toEqual(petData);
    });

    it('deve falhar quando pet não existe', async () => {
      // Arrange
      petRepository.getById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getById('pet123')).rejects.toThrow('Pet não encontrado.');
    });

    it('deve falhar quando erro interno ocorre', async () => {
      // Arrange
      petRepository.getById.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.getById('pet123')).rejects.toThrow('Erro ao buscar o pet.');
    });
  });

  describe('create', () => {
    it('deve criar pet com sucesso', async () => {
      // Arrange
      const petData = {
        name: 'Rex',
        type: 'Cachorro',
        gender: 'M',
        weight: 10,
        account: 'user123'
      };
      const createdPet = createMockPet(petData);
      petRepository.create.mockResolvedValue(createdPet);

      // Act
      const result = await service.create(petData);

      // Assert
      expect(petRepository.create).toHaveBeenCalledWith(petData);
      expect(result).toEqual(createdPet);
    });

    it('deve falhar quando criação falha', async () => {
      // Arrange
      const petData = {
        name: 'Rex',
        type: 'Cachorro',
        gender: 'M',
        weight: 10,
        account: 'user123'
      };
      petRepository.create.mockResolvedValue(null);

      // Act & Assert
      await expect(service.create(petData)).rejects.toThrow('Não foi possível cadastrar o pet.');
    });

    it('deve falhar quando erro interno ocorre', async () => {
      // Arrange
      const petData = {
        name: 'Rex',
        type: 'Cachorro',
        gender: 'M',
        weight: 10,
        account: 'user123'
      };
      petRepository.create.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.create(petData)).rejects.toThrow('Erro ao criar o pet.');
    });
  });

  describe('update', () => {
    it('deve atualizar pet com sucesso', async () => {
      // Arrange
      const updateData = { name: 'Rex Atualizado' };
      const updatedPet = createMockPet(updateData);
      petRepository.update.mockResolvedValue(updatedPet);

      // Act
      const result = await service.update('pet123', updateData);

      // Assert
      expect(petRepository.update).toHaveBeenCalledWith('pet123', updateData);
      expect(result).toEqual(updatedPet);
    });

    it('deve falhar quando pet não existe', async () => {
      // Arrange
      petRepository.update.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update('pet123', { name: 'Rex Atualizado' }))
        .rejects.toThrow('Pet não encontrado para atualização.');
    });

    it('deve falhar quando erro interno ocorre', async () => {
      // Arrange
      petRepository.update.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.update('pet123', { name: 'Rex Atualizado' }))
        .rejects.toThrow('Erro ao atualizar o pet.');
    });
  });

  describe('delete', () => {
    it('deve deletar pet com sucesso', async () => {
      // Arrange
      const petData = createMockPet();
      petRepository.getById.mockResolvedValue(petData);
      petRepository.delete.mockResolvedValue(undefined);

      // Act
      await service.delete('pet123');

      // Assert
      expect(petRepository.getById).toHaveBeenCalledWith('pet123');
      expect(petRepository.delete).toHaveBeenCalledWith('pet123');
    });

    it('deve falhar quando pet não existe', async () => {
      // Arrange
      petRepository.getById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.delete('pet123')).rejects.toThrow('Pet não encontrado para exclusão.');
    });

    it('deve falhar quando erro interno ocorre', async () => {
      // Arrange
      petRepository.getById.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.delete('pet123')).rejects.toThrow('Erro ao deletar o pet.');
    });
  });

  describe('softDelete', () => {
    it('deve fazer soft delete do pet com sucesso', async () => {
      // Arrange
      const petData = createMockPet({ account: 'user123' });
      petRepository.getById.mockResolvedValue(petData);
      petRepository.softDelete.mockResolvedValue(undefined);

      // Act
      await service.softDelete('pet123', 'user123');

      // Assert
      expect(petRepository.softDelete).toHaveBeenCalledWith('pet123');
    });

    it('deve falhar quando pet já foi deletado', async () => {
      // Arrange
      const petData = createMockPet({ deletedAt: new Date() });
      petRepository.getById.mockResolvedValue(petData);

      // Act & Assert
      await expect(service.softDelete('pet123', 'user123'))
        .rejects.toThrow('O Pet já foi deletado.');
    });

    it('deve falhar quando usuário não é proprietário', async () => {
      // Arrange
      const petData = createMockPet({ account: 'owner123' });
      petRepository.getById.mockResolvedValue(petData);

      // Act & Assert
      await expect(service.softDelete('pet123', 'user123'))
        .rejects.toThrow('Somente o proprietário pode deletar o pet.');
    });
  });
});
