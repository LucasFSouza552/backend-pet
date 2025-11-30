import HistoryService from '../../src/services/history.services';
import { ObjectId } from 'mongodb';

jest.mock('../../src/repositories/index', () => ({
  historyRepository: {
    getByAccount: jest.fn(),
    getById: jest.fn(),
    getAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateStatus: jest.fn(),
    delete: jest.fn(),
    getByAccountAndPet: jest.fn()
  },
  petRepository: {
    getById: jest.fn()
  }
}));

jest.mock('../../src/services/index', () => ({
  petService: {
    getById: jest.fn()
  },
  accountService: {
    getById: jest.fn()
  }
}));

jest.mock('../../src/config/mergadopago', () => ({
  preference: {
    create: jest.fn()
  }
}));

jest.mock('uuid', () => {
  const mockV4 = jest.fn(() => 'mock-uuid-123');
  return {
    __esModule: true,
    v4: mockV4,
    default: {
      v4: mockV4
    }
  };
});


jest.mock('../../src/types/IHistoryStatus', () => ({
  IHistoryStatus: ['pending', 'completed', 'cancelled', 'rejected']
}));

describe('HistoryService', () => {
  let service: HistoryService;

  const { historyRepository, petRepository } = require('../../src/repositories/index');
  const { petService, accountService } = require('../../src/services/index');
  const { preference } = require('../../src/config/mergadopago');

  const createMockHistory = (overrides?: any) => ({
    _id: new ObjectId(),
    id: new ObjectId().toString(),
    type: 'adoption',
    pet: new ObjectId().toString(),
    account: new ObjectId().toString(),
    institution: new ObjectId().toString(),
    status: 'pending',
    amount: 100,
    urlPayment: 'https://mercadopago.com/payment',
    externalReference: 'ref-123',
    expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    ...overrides
  });

  const createMockAccount = (overrides?: any) => ({
    id: 'user123',
    email: 'joao@test.com',
    name: 'João Silva',
    ...overrides
  });

  const createMockPet = (overrides?: any) => ({
    id: 'pet123',
    name: 'Rex',
    adopted: false,
    ...overrides
  });

  beforeEach(() => {
    const uuid = require('uuid');
    if (uuid.v4) {
      uuid.v4.mockImplementation(() => 'mock-uuid-123');
    }
    if (uuid.default && uuid.default.v4) {
      uuid.default.v4.mockImplementation(() => 'mock-uuid-123');
    }
    
    service = new HistoryService();
    jest.clearAllMocks();
    
    if (uuid.v4) {
      uuid.v4.mockImplementation(() => 'mock-uuid-123');
    }
    if (uuid.default && uuid.default.v4) {
      uuid.default.v4.mockImplementation(() => 'mock-uuid-123');
    }
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getByAccount', () => {
    it('deve retornar históricos quando existem', async () => {
      const histories = [createMockHistory(), createMockHistory()];
      historyRepository.getByAccount.mockResolvedValue(histories);

      const result = await service.getByAccount({}, 'user123');

      expect(historyRepository.getByAccount).toHaveBeenCalledWith({}, 'user123');
      expect(result).toEqual(histories);
    });

    it('deve falhar quando históricos não são encontrados', async () => {
      historyRepository.getByAccount.mockResolvedValue(null);

      await expect(service.getByAccount({}, 'user123')).rejects.toThrow('Históricos não encontrados.');
    });

    it('deve falhar quando erro interno ocorre', async () => {
      historyRepository.getByAccount.mockRejectedValue(new Error('Database error'));

      await expect(service.getByAccount({}, 'user123')).rejects.toThrow('Erro ao buscar históricos.');
    });
  });

  describe('updateStatus', () => {
    it('deve atualizar status com sucesso', async () => {
      const account = createMockAccount({ id: 'institution123' });
      const history = createMockHistory({
        type: 'adoption',
        institution: 'institution123',
        status: 'pending'
      });
      const updateData = { status: 'completed' };
      accountService.getById.mockResolvedValue(account);
      historyRepository.getById.mockResolvedValue(history);
      historyRepository.updateStatus.mockResolvedValue({ ...history, status: 'completed' });

      const result = await service.updateStatus('history123', 'institution123', updateData);

      expect(accountService.getById).toHaveBeenCalledWith('institution123');
      expect(historyRepository.getById).toHaveBeenCalledWith('history123');
      expect(historyRepository.updateStatus).toHaveBeenCalledWith('history123', updateData);
      expect(result).toEqual(history);
    });

    it('deve falhar quando usuário não existe', async () => {
      accountService.getById.mockResolvedValue(null);

      await expect(service.updateStatus('history123', 'user123', { status: 'completed' }))
        .rejects.toThrow('Usuário não encontrado.');
    });

    it('deve falhar quando status não é informado', async () => {
      const account = createMockAccount();
      accountService.getById.mockResolvedValue(account);

      await expect(service.updateStatus('history123', 'user123', {}))
        .rejects.toThrow('Status deve ser informado.');
    });

    it('deve falhar quando status é inválido', async () => {
      const account = createMockAccount();
      accountService.getById.mockResolvedValue(account);

      await expect(service.updateStatus('history123', 'user123', { status: 'invalid' }))
        .rejects.toThrow('Status inválido.');
    });

    it('deve falhar quando histórico não existe', async () => {
      const account = createMockAccount();
      accountService.getById.mockResolvedValue(account);
      historyRepository.getById.mockResolvedValue(null);

      await expect(service.updateStatus('history123', 'user123', { status: 'completed' }))
        .rejects.toThrow('Histórico não encontrado.');
    });

    it('deve falhar quando tipo não é adoption', async () => {
      const account = createMockAccount();
      const history = createMockHistory({ type: 'donation' });
      accountService.getById.mockResolvedValue(account);
      historyRepository.getById.mockResolvedValue(history);

      await expect(service.updateStatus('history123', 'user123', { status: 'completed' }))
        .rejects.toThrow('Acesso negado.');
    });

    it('deve falhar quando instituição não é proprietária', async () => {
      const account = createMockAccount({ id: 'user123' });
      const history = createMockHistory({ institution: 'other123' });
      accountService.getById.mockResolvedValue(account);
      historyRepository.getById.mockResolvedValue(history);

      await expect(service.updateStatus('history123', 'user123', { status: 'completed' }))
        .rejects.toThrow('Acesso negado.');
    });
  });

  describe('getAll', () => {
    it('deve retornar todos os históricos com sucesso', async () => {
      const histories = [createMockHistory(), createMockHistory()];
      historyRepository.getAll.mockResolvedValue(histories);

      const result = await service.getAll({});

      expect(historyRepository.getAll).toHaveBeenCalledWith({});
      expect(result).toEqual(histories);
    });

    it('deve falhar quando erro interno ocorre', async () => {
      historyRepository.getAll.mockRejectedValue(new Error('Database error'));

      await expect(service.getAll({})).rejects.toThrow('Não foi possível listar os históricos.');
    });
  });

  describe('getById', () => {
    it('deve retornar histórico quando existe', async () => {
      const history = createMockHistory();
      historyRepository.getById.mockResolvedValue(history);

      const result = await service.getById('history123');

      expect(historyRepository.getById).toHaveBeenCalledWith('history123');
      expect(result).toEqual(history);
    });

    it('deve falhar quando histórico não existe', async () => {
      historyRepository.getById.mockResolvedValue(null);

      await expect(service.getById('history123')).rejects.toThrow('Histórico não encontrado.');
    });

    it('deve falhar quando erro interno ocorre', async () => {
      historyRepository.getById.mockRejectedValue(new Error('Database error'));

      await expect(service.getById('history123')).rejects.toThrow('Erro ao buscar histórico.');
    });
  });

  describe('create', () => {
    it('deve criar histórico com sucesso', async () => {
      const pet = createMockPet();
      const historyData = {
        type: 'adoption',
        pet: 'pet123',
        account: 'user123',
        status: 'pending'
      };
      const createdHistory = createMockHistory(historyData);
      petService.getById.mockResolvedValue(pet);
      historyRepository.create.mockResolvedValue(createdHistory);

      const result = await service.create(historyData);

      expect(petService.getById).toHaveBeenCalledWith('pet123');
      expect(historyRepository.create).toHaveBeenCalledWith(historyData);
      expect(result).toEqual(createdHistory);
    });

    it('deve falhar quando pet não é informado', async () => {
      const historyData = {
        type: 'adoption',
        account: 'user123'
      };

      await expect(service.create(historyData as any)).rejects.toThrow('Erro ao criar histórico.');
    });

    it('deve falhar quando pet não existe', async () => {
      const historyData = {
        type: 'adoption',
        pet: 'pet123',
        account: 'user123'
      };
      petService.getById.mockResolvedValue(null);

      await expect(service.create(historyData)).rejects.toThrow('Erro ao criar histórico.');
    });

    it('deve falhar quando pet já foi adotado', async () => {
      const pet = createMockPet({ adopted: true });
      const historyData = {
        type: 'adoption',
        pet: 'pet123',
        account: 'user123'
      };
      petService.getById.mockResolvedValue(pet);

      await expect(service.create(historyData)).rejects.toThrow('Erro ao criar histórico.');
    });

    it('deve falhar quando criação falha', async () => {
      const pet = createMockPet();
      const historyData = {
        type: 'adoption',
        pet: 'pet123',
        account: 'user123'
      };
      petService.getById.mockResolvedValue(pet);
      historyRepository.create.mockResolvedValue(null);

      await expect(service.create(historyData)).rejects.toThrow('Erro ao criar histórico.');
    });
  });

  describe('update', () => {
    it('deve atualizar histórico com sucesso', async () => {
      const pet = createMockPet();
      const updateData = {
        pet: 'pet123',
        status: 'completed'
      };
      const updatedHistory = createMockHistory(updateData);
      petService.getById.mockResolvedValue(pet);
      historyRepository.update.mockResolvedValue(updatedHistory);

      const result = await service.update('history123', updateData);

      expect(petService.getById).toHaveBeenCalledWith('pet123');
      expect(historyRepository.update).toHaveBeenCalledWith('history123', updateData);
      expect(result).toEqual(updatedHistory);
    });

    it('deve falhar quando pet não é informado', async () => {
      const updateData = { status: 'completed' };

      await expect(service.update('history123', updateData as any)).rejects.toThrow('Erro ao atualizar histórico.');
    });

    it('deve falhar quando pet não existe', async () => {
      const updateData = { pet: 'pet123' };
      petService.getById.mockResolvedValue(null);

      await expect(service.update('history123', updateData)).rejects.toThrow('Erro ao atualizar histórico.');
    });

    it('deve falhar quando pet já foi adotado', async () => {
      const pet = createMockPet({ adopted: true });
      const updateData = { pet: 'pet123' };
      petService.getById.mockResolvedValue(pet);

      await expect(service.update('history123', updateData)).rejects.toThrow('Erro ao atualizar histórico.');
    });

    it('deve falhar quando histórico não existe', async () => {
      const pet = createMockPet();
      const updateData = { pet: 'pet123' };
      petService.getById.mockResolvedValue(pet);
      historyRepository.update.mockResolvedValue(null);

      await expect(service.update('history123', updateData)).rejects.toThrow('Erro ao atualizar histórico.');
    });
  });

  describe('delete', () => {
    it('deve deletar histórico com sucesso', async () => {
      const history = createMockHistory();
      historyRepository.getById.mockResolvedValue(history);
      historyRepository.delete.mockResolvedValue(undefined);

      await service.delete('history123');

      expect(historyRepository.getById).toHaveBeenCalledWith('history123');
      expect(historyRepository.delete).toHaveBeenCalledWith('history123');
    });

    it('deve falhar quando histórico não existe', async () => {
      historyRepository.getById.mockResolvedValue(null);

      await expect(service.delete('history123')).rejects.toThrow('Erro ao deletar histórico.');
    });

    it('deve falhar quando erro interno ocorre', async () => {
      historyRepository.getById.mockRejectedValue(new Error('Database error'));

      await expect(service.delete('history123')).rejects.toThrow('Erro ao deletar histórico.');
    });
  });

  describe('donate', () => {
    it('deve criar doação com sucesso', async () => {
      const account = createMockAccount();
      const mockPreferenceResponse = {
        id: 'pref-123',
        init_point: 'https://mercadopago.com/checkout'
      };
      const createdHistory = createMockHistory({
        type: 'donation',
        account: account.id,
        amount: '100.00'
      });
      accountService.getById.mockResolvedValue(account);
      preference.create.mockResolvedValue(mockPreferenceResponse);
      historyRepository.create.mockResolvedValue(createdHistory);

      const result = await service.donate('100', 'user123');

      expect(accountService.getById).toHaveBeenCalledWith('user123');
      expect(preference.create).toHaveBeenCalled();
      expect(historyRepository.create).toHaveBeenCalled();
      expect(result).toEqual({
        id: 'pref-123',
        url: 'https://mercadopago.com/checkout'
      });
    });

    it('deve falhar quando usuário não existe', async () => {
      accountService.getById.mockResolvedValue(null);

      await expect(service.donate('100.00', 'user123')).rejects.toThrow('Usuário não encontrado.');
    });

    it('deve falhar quando criação de preferência falha', async () => {
      const account = createMockAccount();
      accountService.getById.mockResolvedValue(account);
      preference.create.mockResolvedValue(null);

      await expect(service.donate('100.00', 'user123')).rejects.toThrow('Erro ao doar para petApp.');
    });

    it('deve falhar quando criação de histórico falha', async () => {
      const account = createMockAccount();
      const mockPreferenceResponse = {
        id: 'pref-123',
        init_point: 'https://mercadopago.com/checkout'
      };
      accountService.getById.mockResolvedValue(account);
      preference.create.mockResolvedValue(mockPreferenceResponse);
      historyRepository.create.mockResolvedValue(null);

      await expect(service.donate('100.00', 'user123')).rejects.toThrow('Erro ao doar para petApp.');
    });

    it('deve aceitar valores de pagamento positivos', async () => {
      const account = createMockAccount();
      const mockPreferenceResponse = {
        id: 'pref-123',
        init_point: 'https://mercadopago.com/checkout'
      };
      accountService.getById.mockResolvedValue(account);
      preference.create.mockResolvedValue(mockPreferenceResponse);
      historyRepository.create.mockResolvedValue({ id: 'history123' });

      const result = await service.donate('100.00', 'user123');

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('url');
    });
  });

  describe('sponsor', () => {
    it('deve criar patrocínio com sucesso', async () => {
      const institution = createMockAccount({ id: 'institution123' });
      const account = createMockAccount({ id: 'user123' });
      const mockPreferenceResponse = {
        id: 'pref-456',
        init_point: 'https://mercadopago.com/checkout'
      };
      const createdHistory = createMockHistory({
        type: 'sponsorship',
        account: account.id,
        institution: institution.id,
        amount: '200.00'
      });
      accountService.getById
        .mockResolvedValueOnce(institution)
        .mockResolvedValueOnce(account);
      preference.create.mockResolvedValue(mockPreferenceResponse);
      historyRepository.create.mockResolvedValue(createdHistory);

      const result = await service.sponsor('institution123', '200.00', 'user123');

      expect(accountService.getById).toHaveBeenCalledWith('institution123');
      expect(accountService.getById).toHaveBeenCalledWith('user123');
      expect(preference.create).toHaveBeenCalled();
      expect(historyRepository.create).toHaveBeenCalled();
      expect(result).toEqual({
        id: 'pref-456',
        url: 'https://mercadopago.com/checkout'
      });
    });

    it('deve aceitar amount como número', async () => {
      const institution = createMockAccount({ id: 'institution123' });
      const account = createMockAccount({ id: 'user123' });
      const mockPreferenceResponse = {
        id: 'pref-456',
        init_point: 'https://mercadopago.com/checkout'
      };
      const createdHistory = createMockHistory({
        type: 'sponsorship',
        account: account.id,
        institution: institution.id,
        amount: 200
      });
      accountService.getById
        .mockResolvedValueOnce(institution)
        .mockResolvedValueOnce(account);
      preference.create.mockResolvedValue(mockPreferenceResponse);
      historyRepository.create.mockResolvedValue(createdHistory);

      const result = await service.sponsor('institution123', 200, 'user123');

      expect(accountService.getById).toHaveBeenCalledWith('institution123');
      expect(accountService.getById).toHaveBeenCalledWith('user123');
      expect(preference.create).toHaveBeenCalled();
      expect(historyRepository.create).toHaveBeenCalled();
      expect(result).toEqual({
        id: 'pref-456',
        url: 'https://mercadopago.com/checkout'
      });
    });

    it('deve falhar quando instituição não existe', async () => {
      accountService.getById.mockResolvedValue(null);

      await expect(service.sponsor('institution123', 200, 'user123'))
        .rejects.toThrow('Instituição não encontrada.');
    });

    it('deve falhar quando usuário não existe', async () => {
      const institution = createMockAccount({ id: 'institution123' });
      accountService.getById
        .mockResolvedValueOnce(institution)
        .mockResolvedValueOnce(null);

      await expect(service.sponsor('institution123', 200, 'user123'))
        .rejects.toThrow('Usuário não encontrado.');
    });

    it('deve falhar quando usuário é proprietário da instituição', async () => {
      const institution = createMockAccount({ id: 'user123' });
      const account = createMockAccount({ id: 'user123' });
      accountService.getById
        .mockResolvedValueOnce(institution)
        .mockResolvedValueOnce(account);

      await expect(service.sponsor('user123', 200, 'user123'))
        .rejects.toThrow('Usuário proprietário.');
    });

    it('deve falhar quando criação de preferência falha', async () => {
      const institution = createMockAccount({ id: 'institution123' });
      const account = createMockAccount({ id: 'user123' });
      accountService.getById
        .mockResolvedValueOnce(institution)
        .mockResolvedValueOnce(account);
      preference.create.mockResolvedValue(null);

      await expect(service.sponsor('institution123', 200, 'user123'))
        .rejects.toThrow('Erro ao patrocinar a instituição.');
    });

    it('deve falhar quando criação de histórico falha', async () => {
      const institution = createMockAccount({ id: 'institution123' });
      const account = createMockAccount({ id: 'user123' });
      const mockPreferenceResponse = {
        id: 'pref-456',
        init_point: 'https://mercadopago.com/checkout'
      };
      accountService.getById
        .mockResolvedValueOnce(institution)
        .mockResolvedValueOnce(account);
      preference.create.mockResolvedValue(mockPreferenceResponse);
      historyRepository.create.mockResolvedValue(null);

      await expect(service.sponsor('institution123', 200, 'user123'))
        .rejects.toThrow('Erro ao patrocinar a instituição.');
    });
  });

  describe('paymentReturn', () => {
    it('deve processar retorno de pagamento com sucesso', async () => {
      const payment = createMockHistory({
        id: 'payment123',
        status: 'pending',
        externalReference: 'ref-123',
        expiresAt: new Date(Date.now() + 30 * 60 * 1000)
      });
      historyRepository.getById.mockResolvedValue(payment);
      historyRepository.update.mockResolvedValue({ ...payment, status: 'completed' });

      const result = await service.paymentReturn('payment123', 'pending', 'ref-123');

      expect(historyRepository.getById).toHaveBeenCalledWith('payment123');
      expect(historyRepository.update).toHaveBeenCalledWith('payment123', { status: 'completed' });
      expect(result).toEqual(payment);
    });

    it('deve falhar quando pagamento não existe', async () => {
      historyRepository.getById.mockResolvedValue(null);

      await expect(service.paymentReturn('payment123', 'pending', 'ref-123'))
        .rejects.toThrow('Pagamento não encontrado.');
    });

    it('deve falhar quando pagamento está expirado', async () => {
      const payment = createMockHistory({
        id: 'payment123',
        status: 'pending',
        externalReference: 'ref-123',
        expiresAt: new Date(Date.now() - 1000) // Expirado
      });
      historyRepository.getById.mockResolvedValue(payment);
      historyRepository.update.mockResolvedValue({ ...payment, status: 'cancelled' });

      await expect(service.paymentReturn('payment123', 'pending', 'ref-123'))
        .rejects.toThrow('Pagamento expirado.');
      expect(historyRepository.update).toHaveBeenCalledWith('payment123', { status: 'cancelled' });
    });

    it('deve falhar quando pagamento já foi processado', async () => {
      const payment = createMockHistory({
        id: 'payment123',
        status: 'completed',
        externalReference: 'ref-123',
        expiresAt: new Date(Date.now() + 30 * 60 * 1000)
      });
      historyRepository.getById.mockResolvedValue(payment);

      await expect(service.paymentReturn('payment123', 'completed', 'ref-123'))
        .rejects.toThrow('Pagamento já processado.');
    });

    it('deve falhar quando status do pagamento é inválido', async () => {
      const payment = createMockHistory({
        id: 'payment123',
        status: 'pending',
        externalReference: 'ref-123',
        expiresAt: new Date(Date.now() + 30 * 60 * 1000)
      });
      historyRepository.getById.mockResolvedValue(payment);

      await expect(service.paymentReturn('payment123', 'completed', 'ref-123'))
        .rejects.toThrow('Status do pagamento inválido.');
    });

    it('deve falhar quando external reference é inválido', async () => {
      const payment = createMockHistory({
        id: 'payment123',
        status: 'pending',
        externalReference: 'ref-123',
        expiresAt: new Date(Date.now() + 30 * 60 * 1000)
      });
      historyRepository.getById.mockResolvedValue(payment);

      await expect(service.paymentReturn('payment123', 'pending', 'ref-456'))
        .rejects.toThrow('External reference inválido.');
    });

    it('deve impedir processar pagamento já processado', async () => {
      const payment = createMockHistory({
        id: 'payment123',
        status: 'completed',
        externalReference: 'ref-123',
        expiresAt: new Date(Date.now() + 3600000)
      });
      historyRepository.getById.mockResolvedValue(payment);

      await expect(service.paymentReturn('payment123', 'completed', 'ref-123'))
        .rejects.toThrow('Pagamento já processado.');
    });

    it('deve impedir processar pagamento expirado', async () => {
      const expiredPayment = createMockHistory({
        id: 'payment123',
        status: 'pending',
        externalReference: 'ref-123',
        expiresAt: new Date(Date.now() - 3600000)
      });
      historyRepository.getById.mockResolvedValue(expiredPayment);
      historyRepository.update.mockResolvedValue({});

      await expect(service.paymentReturn('payment123', 'pending', 'ref-123'))
        .rejects.toThrow('Pagamento expirado.');
    });
  });
});
