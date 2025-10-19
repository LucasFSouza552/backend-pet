import PetService from '../../src/services/Pet.services';
import { ThrowError } from '../../src/errors/ThrowError';

// Mock dos repositórios e dependências
jest.mock('../../src/repositories/index', () => ({
  historyRepository: {
    create: jest.fn(),
    getById: jest.fn(),
    update: jest.fn()
  },
  petRepository: {
    getById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    getAll: jest.fn(),
    create: jest.fn()
  }
}));

jest.mock('../../src/repositories/PictureStorage.repository', () => ({
  PictureStorageRepository: {
    uploadImage: jest.fn(),
    deleteImage: jest.fn()
  }
}));

jest.mock('../../src/services/index', () => ({
  accountService: {
    getById: jest.fn()
  }
}));

jest.mock('../../src/config/mergadopago', () => ({
  preference: {
    create: jest.fn()
  }
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'uuid-123')
}));

describe('PetService', () => {
  const service = new PetService();

  const { historyRepository, petRepository } = require('../../src/repositories/index');
  const { PictureStorageRepository } = require('../../src/repositories/PictureStorage.repository');
  const { accountService } = require('../../src/services/index');
  const { preference } = require('../../src/config/mergadopago');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('updatePetImages', () => {
    it('deve atualizar imagens do pet com sucesso', async () => {
      // Arrange
      const petData = { _id: 'pet123', name: 'Rex' };
      const files = [
        { buffer: Buffer.from('image1') },
        { buffer: Buffer.from('image2') }
      ] as Express.Multer.File[];
      petRepository.getById.mockResolvedValue(petData);
      PictureStorageRepository.uploadImage
        .mockResolvedValueOnce('image_id_1')
        .mockResolvedValueOnce('image_id_2');
      petRepository.update.mockResolvedValue(undefined);

      // Act
      const result = await service.updatePetImages('pet123', files);

      // Assert
      expect(petRepository.getById).toHaveBeenCalledWith('pet123');
      expect(PictureStorageRepository.uploadImage).toHaveBeenCalledTimes(2);
      expect(petRepository.update).toHaveBeenCalledWith('pet123', {
        images: ['image_id_1', 'image_id_2']
      });
      expect(result).toEqual(['image_id_1', 'image_id_2']);
    });

    it('deve falhar quando pet não existe', async () => {
      // Arrange
      petRepository.getById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.updatePetImages('pet123', [])).rejects.toThrow('Pet não encontrado.');
    });

    it('deve ignorar arquivos sem buffer', async () => {
      // Arrange
      const petData = { _id: 'pet123', name: 'Rex' };
      const files = [
        { buffer: Buffer.from('image1') },
        { buffer: null } // arquivo inválido
      ] as Express.Multer.File[];
      petRepository.getById.mockResolvedValue(petData);
      PictureStorageRepository.uploadImage.mockResolvedValue('image_id_1');
      petRepository.update.mockResolvedValue(undefined);

      // Act
      const result = await service.updatePetImages('pet123', files);

      // Assert
      expect(PictureStorageRepository.uploadImage).toHaveBeenCalledTimes(1);
      expect(result).toEqual(['image_id_1']);
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
      const petData = { _id: 'pet123', images: ['image1', 'image2'] };
      const imageId = 'image1';
      petRepository.getById.mockResolvedValue(petData);
      PictureStorageRepository.deleteImage.mockResolvedValue(undefined);
      petRepository.update.mockResolvedValue(undefined);

      // Act
      await service.deletePetImage('pet123', imageId);

      // Assert
      expect(PictureStorageRepository.deleteImage).toHaveBeenCalledWith(imageId);
      expect(petRepository.update).toHaveBeenCalledWith('pet123', {
        images: ['image2']
      });
    });

    it('deve falhar quando pet não existe', async () => {
      // Arrange
      petRepository.getById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.deletePetImage('pet123', 'image1')).rejects.toThrow('Pet não encontrado.');
    });

    it('deve falhar quando erro interno ocorre', async () => {
      // Arrange
      petRepository.getById.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.deletePetImage('pet123', 'image1')).rejects.toThrow('Erro ao deletar imagem.');
    });
  });

  describe('donate', () => {
    it('deve processar doação com sucesso', async () => {
      // Arrange
      const accountData = { id: 'user123', email: 'joao@test.com' };
      const historyData = { id: 'history123' };
      const preferenceResponse = {
        id: 'preference123',
        init_point: 'https://payment-url.com'
      };
      accountService.getById.mockResolvedValue(accountData);
      historyRepository.create.mockResolvedValue(historyData);
      preference.create.mockResolvedValue(preferenceResponse);

      // Act
      const result = await service.donate('pet123', '100.00', 'user123');

      // Assert
      expect(accountService.getById).toHaveBeenCalledWith('user123');
      expect(historyRepository.create).toHaveBeenCalledWith({
        type: 'donation',
        amount: '100.00',
        account: 'user123',
        status: 'pending'
      });
      expect(preference.create).toHaveBeenCalled();
      expect(result).toEqual({
        id: 'preference123',
        url: 'https://payment-url.com'
      });
    });

    it('deve falhar quando usuário não existe', async () => {
      // Arrange
      accountService.getById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.donate('pet123', '100.00', 'user123')).rejects.toThrow('Erro ao patrocinar o pet.');
    });

    it('deve falhar quando criação de histórico falha', async () => {
      // Arrange
      const accountData = { id: 'user123', email: 'joao@test.com' };
      accountService.getById.mockResolvedValue(accountData);
      historyRepository.create.mockResolvedValue(null);

      // Act & Assert
      await expect(service.donate('pet123', '100.00', 'user123')).rejects.toThrow('Erro ao patrocinar o pet.');
    });

    it('deve falhar quando criação de preferência falha', async () => {
      // Arrange
      const accountData = { id: 'user123', email: 'joao@test.com' };
      const historyData = { id: 'history123' };
      accountService.getById.mockResolvedValue(accountData);
      historyRepository.create.mockResolvedValue(historyData);
      preference.create.mockResolvedValue(null);

      // Act & Assert
      await expect(service.donate('pet123', '100.00', 'user123')).rejects.toThrow('Erro ao patrocinar o pet.');
    });

    it('deve falhar quando erro interno ocorre', async () => {
      // Arrange
      accountService.getById.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.donate('pet123', '100.00', 'user123')).rejects.toThrow('Erro ao patrocinar o pet.');
    });
  });

  describe('sponsor', () => {
    it('deve processar patrocínio com sucesso', async () => {
      // Arrange
      const petData = { _id: 'pet123', account: 'owner123' };
      const accountData = { id: 'user123', email: 'joao@test.com' };
      const historyData = { id: 'history123' };
      const preferenceResponse = {
        id: 'preference123',
        init_point: 'https://payment-url.com'
      };
      petRepository.getById.mockResolvedValue(petData);
      accountService.getById.mockResolvedValue(accountData);
      historyRepository.create.mockResolvedValue(historyData);
      preference.create.mockResolvedValue(preferenceResponse);

      // Act
      const result = await service.sponsor('pet123', '100.00', 'user123');

      // Assert
      expect(petRepository.getById).toHaveBeenCalledWith('pet123');
      expect(accountService.getById).toHaveBeenCalledWith('user123');
      expect(historyRepository.create).toHaveBeenCalledWith({
        type: 'sponsorship',
        amount: '100.00',
        account: 'user123',
        status: 'pending'
      });
      expect(result).toEqual({
        id: 'preference123',
        url: 'https://payment-url.com'
      });
    });

    it('deve falhar quando pet não existe', async () => {
      // Arrange
      petRepository.getById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.sponsor('pet123', '100.00', 'user123')).rejects.toThrow('Erro ao patrocinar o pet.');
    });

    it('deve falhar quando usuário não existe', async () => {
      // Arrange
      const petData = { _id: 'pet123', account: 'owner123' };
      petRepository.getById.mockResolvedValue(petData);
      accountService.getById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.sponsor('pet123', '100.00', 'user123')).rejects.toThrow('Erro ao patrocinar o pet.');
    });

    it('deve falhar quando usuário é proprietário do pet', async () => {
      // Arrange
      const petData = { _id: 'pet123', account: 'user123' };
      const accountData = { id: 'user123', email: 'joao@test.com' };
      petRepository.getById.mockResolvedValue(petData);
      accountService.getById.mockResolvedValue(accountData);

      // Act & Assert
      await expect(service.sponsor('pet123', '100.00', 'user123')).rejects.toThrow('Erro ao patrocinar o pet.');
    });

    it('deve falhar quando erro interno ocorre', async () => {
      // Arrange
      petRepository.getById.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.sponsor('pet123', '100.00', 'user123')).rejects.toThrow('Erro ao patrocinar o pet.');
    });
  });

  describe('requestAdoption', () => {
    it('deve solicitar adoção com sucesso', async () => {
      // Arrange
      const accountData = { id: 'user123' };
      const petData = { _id: 'pet123', account: 'owner123', adopted: false, id: 'pet123' };
      const historyData = { id: 'history123' };
      accountService.getById.mockResolvedValue(accountData);
      petRepository.getById.mockResolvedValue(petData);
      historyRepository.create.mockResolvedValue(historyData);
      petRepository.update.mockResolvedValue(undefined);

      // Act
      const result = await service.requestAdoption('pet123', 'user123');

      // Assert
      expect(accountService.getById).toHaveBeenCalledWith('user123');
      expect(petRepository.getById).toHaveBeenCalledWith('pet123');
      expect(historyRepository.create).toHaveBeenCalledWith({
        type: 'adoption',
        pet: 'pet123',
        account: 'user123',
        institution: 'owner123',
        status: 'pending'
      });
      expect(petRepository.update).toHaveBeenCalledWith('pet123', { adopted: true });
      expect(result).toEqual(historyData);
    });

    it('deve falhar quando usuário não existe', async () => {
      // Arrange
      accountService.getById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.requestAdoption('pet123', 'user123')).rejects.toThrow('Erro ao solicitar adotação.');
    });

    it('deve falhar quando pet não existe', async () => {
      // Arrange
      const accountData = { id: 'user123' };
      accountService.getById.mockResolvedValue(accountData);
      petRepository.getById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.requestAdoption('pet123', 'user123')).rejects.toThrow('Erro ao solicitar adotação.');
    });

    it('deve falhar quando pet já foi adotado', async () => {
      // Arrange
      const accountData = { id: 'user123' };
      const petData = { _id: 'pet123', account: 'owner123', adopted: true };
      accountService.getById.mockResolvedValue(accountData);
      petRepository.getById.mockResolvedValue(petData);

      // Act & Assert
      await expect(service.requestAdoption('pet123', 'user123')).rejects.toThrow('Erro ao solicitar adotação.');
    });

    it('deve falhar quando usuário é proprietário do pet', async () => {
      // Arrange
      const accountData = { id: 'user123' };
      const petData = { _id: 'pet123', account: 'user123', adopted: false };
      accountService.getById.mockResolvedValue(accountData);
      petRepository.getById.mockResolvedValue(petData);

      // Act & Assert
      await expect(service.requestAdoption('pet123', 'user123')).rejects.toThrow('Erro ao solicitar adotação.');
    });

    it('deve falhar quando criação de histórico falha', async () => {
      // Arrange
      const accountData = { id: 'user123' };
      const petData = { _id: 'pet123', account: 'owner123', adopted: false };
      accountService.getById.mockResolvedValue(accountData);
      petRepository.getById.mockResolvedValue(petData);
      historyRepository.create.mockResolvedValue(null);

      // Act & Assert
      await expect(service.requestAdoption('pet123', 'user123')).rejects.toThrow('Erro ao solicitar adotação.');
    });

    it('deve falhar quando erro interno ocorre', async () => {
      // Arrange
      accountService.getById.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.requestAdoption('pet123', 'user123')).rejects.toThrow('Erro ao solicitar adotação.');
    });
  });

  describe('paymentReturn', () => {
    it('deve processar retorno de pagamento com sucesso', async () => {
      // Arrange
      const paymentData = {
        id: 'payment123',
        status: 'pending',
        externalReference: 'ref123'
      };
      historyRepository.getById.mockResolvedValue(paymentData);
      historyRepository.update.mockResolvedValue(undefined);

      // Act
      const result = await service.paymentReturn('payment123', 'pending', 'ref123');

      // Assert
      expect(historyRepository.getById).toHaveBeenCalledWith('payment123');
      expect(historyRepository.update).toHaveBeenCalledWith('payment123', { status: 'completed' });
      expect(result).toEqual(paymentData);
    });

    it('deve falhar quando pagamento não existe', async () => {
      // Arrange
      historyRepository.getById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.paymentReturn('payment123', 'pending', 'ref123')).rejects.toThrow('Pagamento não encontrado.');
    });

    it('deve falhar quando pagamento já foi processado', async () => {
      // Arrange
      const paymentData = {
        id: 'payment123',
        status: 'completed',
        externalReference: 'ref123'
      };
      historyRepository.getById.mockResolvedValue(paymentData);

      // Act & Assert
      await expect(service.paymentReturn('payment123', 'pending', 'ref123')).rejects.toThrow('Pagamento já processado.');
    });

    it('deve falhar quando status não confere', async () => {
      // Arrange
      const paymentData = {
        id: 'payment123',
        status: 'pending',
        externalReference: 'ref123'
      };
      historyRepository.getById.mockResolvedValue(paymentData);

      // Act & Assert
      await expect(service.paymentReturn('payment123', 'approved', 'ref123')).rejects.toThrow('Status do pagamento inválido.');
    });

    it('deve falhar quando external reference não confere', async () => {
      // Arrange
      const paymentData = {
        id: 'payment123',
        status: 'pending',
        externalReference: 'ref123'
      };
      historyRepository.getById.mockResolvedValue(paymentData);

      // Act & Assert
      await expect(service.paymentReturn('payment123', 'pending', 'ref456')).rejects.toThrow('External reference inválido.');
    });

    it('deve falhar quando erro interno ocorre', async () => {
      // Arrange
      historyRepository.getById.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.paymentReturn('payment123', 'pending', 'ref123')).rejects.toThrow('Erro ao processar o retorno do pagamento.');
    });
  });

  describe('getAll', () => {
    it('deve retornar lista de pets', async () => {
      // Arrange
      const pets = [
        { _id: 'pet1', name: 'Rex' },
        { _id: 'pet2', name: 'Mimi' }
      ];
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
      const petData = { _id: 'pet123', name: 'Rex' };
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
      const createdPet = { _id: 'pet123', ...petData };
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
      const updatedPet = { _id: 'pet123', name: 'Rex Atualizado' };
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
      await expect(service.update('pet123', { name: 'Rex Atualizado' })).rejects.toThrow('Pet não encontrado para atualização.');
    });

    it('deve falhar quando erro interno ocorre', async () => {
      // Arrange
      petRepository.update.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.update('pet123', { name: 'Rex Atualizado' })).rejects.toThrow('Erro ao atualizar o pet.');
    });
  });

  describe('delete', () => {
    it('deve deletar pet com sucesso', async () => {
      // Arrange
      const petData = { _id: 'pet123', name: 'Rex' };
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
});
