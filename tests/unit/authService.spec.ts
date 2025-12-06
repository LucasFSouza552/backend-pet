import AuthService from '../../src/services/auth.services';

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
  }
}));

jest.mock('../../src/utils/aes-crypto', () => ({
  cryptPassword: jest.fn(),
  validatePassword: jest.fn()
}));

jest.mock('../../src/utils/emailService', () => ({
  sendEmail: jest.fn()
}));

jest.mock('../../src/utils/JwtEncoder', () => ({
  __esModule: true,
  default: {
    encodeToken: jest.fn(),
    isJwtTokenValid: jest.fn()
  }
}));

jest.mock('templetes/forgotPasswordTemplate', () => ({
  __esModule: true,
  default: jest.fn((name: string, token: string) => `<html>${name} ${token}</html>`)
}));

jest.mock('templetes/validateEmailTemplate', () => ({
  __esModule: true,
  default: jest.fn((name: string, token: string) => `<html>${name} ${token}</html>`)
}));

jest.mock('../../src/Mappers/accountMapper', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation((account) => ({
    id: account._id,
    email: account.email,
    name: account.name,
    verified: account.verified
  }))
}));

describe('AuthService', () => {
  let service: AuthService;

  const { authRepository } = require('../../src/repositories/index');
  const { cryptPassword, validatePassword } = require('../../src/utils/aes-crypto');
  const { sendEmail } = require('../../src/utils/emailService');
  const JWT = require('../../src/utils/JwtEncoder').default;

  const createValidUserData = (overrides?: any) => ({
    name: 'João Silva',
    email: 'joao@test.com',
    password: 'senha123',
    cpf: '12345678901',
    phone_number: '11999999999',
    address: {
      street: 'Rua das Flores',
      number: '123',
      city: 'São Paulo',
      cep: '01234-567',
      state: 'SP'
    },
    ...overrides
  });

  const createMockAccount = (overrides?: any) => ({
    _id: 'user123',
    id: 'user123',
    email: 'joao@test.com',
    name: 'João Silva',
    password: 'hashed_password',
    verified: false,
    ...overrides
  });

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService();
  });

  describe('getByEmail', () => {
    it('deve retornar usuário quando email existe', async () => {
      const userData = createMockAccount();
      authRepository.getByEmail.mockResolvedValue(userData);

      const result = await service.getByEmail('joao@test.com');

      expect(authRepository.getByEmail).toHaveBeenCalledWith('joao@test.com');
      expect(result).toEqual(userData);
    });

    it('deve retornar null quando email não existe', async () => {
      authRepository.getByEmail.mockResolvedValue(null);

      const result = await service.getByEmail('inexistente@test.com');

      expect(result).toBeNull();
    });

    it('deve falhar quando erro interno ocorre', async () => {
      authRepository.getByEmail.mockRejectedValue(new Error('Database error'));

      await expect(service.getByEmail('joao@test.com')).rejects.toThrow('Não foi possível buscar o usuário.');
    });
  });

  describe('changePassword', () => {
    const changePasswordData = {
      currentPassword: 'senha_atual',
      newPassword: 'nova_senha'
    };

    it('deve alterar senha com sucesso', async () => {
      const userData = createMockAccount({ password: 'hashed_current_password' });
      authRepository.getById.mockResolvedValue(userData);
      validatePassword.mockResolvedValue(true);
      cryptPassword.mockResolvedValue('hashed_new_password');
      authRepository.changePassword.mockResolvedValue(undefined);

      await service.changePassword('user123', changePasswordData);

      expect(authRepository.getById).toHaveBeenCalledWith('user123');
      expect(validatePassword).toHaveBeenCalledWith('senha_atual', 'hashed_current_password');
      expect(cryptPassword).toHaveBeenCalledWith('nova_senha');
      expect(authRepository.changePassword).toHaveBeenCalledWith('user123', 'hashed_new_password');
    });

    it('deve falhar quando usuário não existe', async () => {
      authRepository.getById.mockResolvedValue(null);

      await expect(service.changePassword('user123', changePasswordData)).rejects.toThrow('Usuário não encontrado.');
    });

    it('deve falhar quando senha atual está incorreta', async () => {
      const userData = createMockAccount({ password: 'hashed_current_password' });
      authRepository.getById.mockResolvedValue(userData);
      validatePassword.mockResolvedValue(false);

      await expect(service.changePassword('user123', changePasswordData)).rejects.toThrow('As senhas não concidem.');
      expect(authRepository.changePassword).not.toHaveBeenCalled();
    });

    it('deve falhar quando erro interno ocorre', async () => {
      authRepository.getById.mockRejectedValue(new Error('Database error'));

      await expect(service.changePassword('user123', changePasswordData)).rejects.toThrow('Não foi possível atualizar a senha.');
    });
  });

  describe('create', () => {
    const validUserData = createValidUserData();

    it('deve criar usuário com sucesso', async () => {
      const mockAccount = createMockAccount(validUserData);
      const originalPassword = validUserData.password;
      authRepository.getByEmail.mockResolvedValue(null);
      authRepository.getByCpf.mockResolvedValue(null);
      authRepository.getByCnpj.mockResolvedValue(null);
      cryptPassword.mockResolvedValue('hashed_password');
      authRepository.create.mockResolvedValue(mockAccount);
      JWT.encodeToken.mockReturnValue('jwt_token');
      sendEmail.mockResolvedValue(undefined);

      await service.create(validUserData);

      expect(authRepository.getByEmail).toHaveBeenCalledWith(validUserData.email);
      expect(authRepository.getByCpf).toHaveBeenCalledWith(validUserData.cpf);
      expect(cryptPassword).toHaveBeenCalledWith(originalPassword);
      expect(JWT.encodeToken).toHaveBeenCalledWith({ id: 'user123' });
      expect(sendEmail).toHaveBeenCalled();
    });

    it('deve criar instituição com CNPJ com sucesso', async () => {
      const institutionData = createValidUserData({ cnpj: '12345678901234', cpf: undefined });
      const mockInstitution = createMockAccount({ ...institutionData, role: 'institution' });
      authRepository.getByEmail.mockResolvedValue(null);
      authRepository.getByCnpj.mockResolvedValue(null);
      cryptPassword.mockResolvedValue('hashed_password');
      authRepository.create.mockResolvedValue(mockInstitution);
      JWT.encodeToken.mockReturnValue('jwt_token');
      sendEmail.mockResolvedValue(undefined);

      await service.create(institutionData);

      expect(authRepository.getByCnpj).toHaveBeenCalledWith(institutionData.cnpj);
      expect(authRepository.getByCpf).not.toHaveBeenCalled();
    });

    it('deve falhar quando email já existe', async () => {
      authRepository.getByEmail.mockResolvedValue(createMockAccount());

      await expect(service.create(validUserData)).rejects.toThrow('E-mail já cadastrado.');
      expect(authRepository.create).not.toHaveBeenCalled();
    });

    it('deve falhar quando CPF já existe', async () => {
      authRepository.getByEmail.mockResolvedValue(null);
      authRepository.getByCpf.mockResolvedValue(createMockAccount());

      await expect(service.create(validUserData)).rejects.toThrow('CPF já cadastrado.');
    });

    it('deve falhar quando CNPJ já existe', async () => {
      const institutionData = createValidUserData({ cnpj: '12345678901234', cpf: undefined });
      authRepository.getByEmail.mockResolvedValue(null);
      authRepository.getByCnpj.mockResolvedValue(createMockAccount());

      await expect(service.create(institutionData)).rejects.toThrow('CNPJ já cadastrado.');
    });

    it('deve falhar quando envio de email falha', async () => {
      const mockAccount = createMockAccount(validUserData);
      authRepository.getByEmail.mockResolvedValue(null);
      authRepository.getByCpf.mockResolvedValue(null);
      authRepository.getByCnpj.mockResolvedValue(null);
      cryptPassword.mockResolvedValue('hashed_password');
      authRepository.create.mockResolvedValue(mockAccount);
      JWT.encodeToken.mockReturnValue('jwt_token');
      sendEmail.mockRejectedValue(new Error('Email service error'));

      await expect(service.create(validUserData)).rejects.toThrow('Não foi possível enviar o email de confirmação.');
    });

    it('deve falhar quando criação no banco falha', async () => {
      authRepository.getByEmail.mockResolvedValue(null);
      authRepository.getByCpf.mockResolvedValue(null);
      cryptPassword.mockResolvedValue('hashed_password');
      authRepository.create.mockRejectedValue(new Error('Database error'));

      await expect(service.create(validUserData)).rejects.toThrow('Database error');
    });

    it('deve falhar quando erro interno ocorre', async () => {
      authRepository.getByEmail.mockRejectedValue(new Error('Database error'));

      await expect(service.create(validUserData)).rejects.toThrow('Não foi possível criar o usuário.');
    });
  });

  describe('verifyEmail', () => {
    it('deve verificar email com sucesso', async () => {
      const token = 'valid_token';
      const decodedToken = { data: { id: 'user123' } };
      const userData = createMockAccount({ verified: false });
      JWT.isJwtTokenValid.mockReturnValue(decodedToken);
      authRepository.getById.mockResolvedValue(userData);
      authRepository.updateVerificationToken.mockResolvedValue({ ...userData, verified: true });

      const result = await service.verifyEmail(token);

      expect(JWT.isJwtTokenValid).toHaveBeenCalledWith(token);
      expect(authRepository.getById).toHaveBeenCalledWith('user123');
      expect(authRepository.updateVerificationToken).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('deve falhar quando token está vazio', async () => {
      await expect(service.verifyEmail('')).rejects.toThrow('Usuário não encontrado.');
      expect(JWT.isJwtTokenValid).not.toHaveBeenCalled();
    });

    it('deve falhar quando token é inválido', async () => {
      JWT.isJwtTokenValid.mockReturnValue(null);

      await expect(service.verifyEmail('invalid_token')).rejects.toThrow('Sessão inválida.');
    });

    it('deve falhar quando ID não está no token', async () => {
      const decodedToken = { data: {} };
      JWT.isJwtTokenValid.mockReturnValue(decodedToken);
      authRepository.getById.mockResolvedValue(null);

      await expect(service.verifyEmail('token')).rejects.toThrow('Usuário não encontrado.');
    });

    it('deve falhar quando usuário não existe', async () => {
      const token = 'valid_token';
      const decodedToken = { data: { id: 'user123' } };
      JWT.isJwtTokenValid.mockReturnValue(decodedToken);
      authRepository.getById.mockResolvedValue(null);

      await expect(service.verifyEmail(token)).rejects.toThrow('Usuário não encontrado.');
    });

    it('deve falhar quando atualização de verificação falha', async () => {
      const token = 'valid_token';
      const decodedToken = { data: { id: 'user123' } };
      const userData = createMockAccount({ verified: false });
      JWT.isJwtTokenValid.mockReturnValue(decodedToken);
      authRepository.getById.mockResolvedValue(userData);
      authRepository.updateVerificationToken.mockResolvedValue(null);

      await expect(service.verifyEmail(token)).rejects.toThrow('Usuário não encontrado.');
    });

    it('deve falhar quando erro interno ocorre', async () => {
      JWT.isJwtTokenValid.mockImplementation(() => {
        throw new Error('JWT error');
      });

      await expect(service.verifyEmail('token')).rejects.toThrow('Nao foi possivel buscar o usuario.');
    });
  });

  describe('forgotPassword', () => {
    it('deve enviar email de recuperação com sucesso', async () => {
      const email = 'joao@test.com';
      const userData = createMockAccount();
      authRepository.getByEmail.mockResolvedValue(userData);
      JWT.encodeToken.mockReturnValue('jwt_token');
      sendEmail.mockResolvedValue(undefined);

      await service.forgotPassword(email);

      expect(authRepository.getByEmail).toHaveBeenCalledWith(email);
      expect(JWT.encodeToken).toHaveBeenCalledWith({ id: 'user123' });
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
        to: email,
          subject: 'Recuperação de Senha - MyPets'
        })
      );
    });

    it('deve falhar quando usuário não existe', async () => {
      authRepository.getByEmail.mockResolvedValue(null);

      await expect(service.forgotPassword('inexistente@test.com')).rejects.toThrow('Usuário não encontrado.');
      expect(sendEmail).not.toHaveBeenCalled();
    });

    it('deve falhar quando envio de email falha', async () => {
      const email = 'joao@test.com';
      const userData = createMockAccount();
      authRepository.getByEmail.mockResolvedValue(userData);
      JWT.encodeToken.mockReturnValue('jwt_token');
      sendEmail.mockRejectedValue(new Error('Email service error'));

      await expect(service.forgotPassword(email)).rejects.toThrow('Não foi possivel enviar o email.');
    });

    it('deve falhar quando erro interno ocorre', async () => {
      authRepository.getByEmail.mockRejectedValue(new Error('Database error'));

      await expect(service.forgotPassword('joao@test.com')).rejects.toThrow('Não foi possível redefinir a senha.');
    });
  });

  describe('resetPassword', () => {
    it('deve redefinir senha com sucesso', async () => {
      const token = 'valid_token';
      const password = 'nova_senha';
      const decodedToken = { data: { id: 'user123' } };
      const userData = createMockAccount({ password: 'old_hashed_password' });
      authRepository.getTokenVerification.mockResolvedValue({ token });
      JWT.isJwtTokenValid.mockReturnValue(decodedToken);
      authRepository.getById.mockResolvedValue(userData);
      cryptPassword.mockResolvedValue('new_hashed_password');
      authRepository.changePassword.mockResolvedValue(undefined);

      await service.resetPassword(token, password);

      expect(authRepository.getTokenVerification).toHaveBeenCalledWith(token);
      expect(JWT.isJwtTokenValid).toHaveBeenCalledWith(token);
      expect(authRepository.getById).toHaveBeenCalledWith('user123');
      expect(cryptPassword).toHaveBeenCalledWith(password);
      expect(authRepository.changePassword).toHaveBeenCalledWith('user123', 'new_hashed_password');
    });

    it('deve falhar quando token de verificação não existe', async () => {
      authRepository.getTokenVerification.mockReturnValue(null);

      await expect(service.resetPassword('invalid_token', 'nova_senha')).rejects.toThrow('Sessão inválida.');
      expect(JWT.isJwtTokenValid).not.toHaveBeenCalled();
    });

    it('deve falhar quando token JWT é inválido', async () => {
      authRepository.getTokenVerification.mockResolvedValue({ token: 'valid_token' });
      JWT.isJwtTokenValid.mockReturnValue(null);

      await expect(service.resetPassword('invalid_token', 'nova_senha')).rejects.toThrow('Sessão inválida.');
    });

    it('deve falhar quando ID do usuário não está no token', async () => {
      const token = 'valid_token';
      const decodedToken = { data: {} };
      authRepository.getTokenVerification.mockResolvedValue({ token });
      JWT.isJwtTokenValid.mockReturnValue(decodedToken);

      await expect(service.resetPassword(token, 'nova_senha')).rejects.toThrow('Sessão inválida.');
    });

    it('deve falhar quando usuário não existe', async () => {
      const token = 'valid_token';
      const decodedToken = { data: { id: 'user123' } };
      authRepository.getTokenVerification.mockResolvedValue({ token });
      JWT.isJwtTokenValid.mockReturnValue(decodedToken);
      authRepository.getById.mockResolvedValue(null);

      await expect(service.resetPassword(token, 'nova_senha')).rejects.toThrow('Usuário não encontrado.');
    });

    it('deve falhar quando erro interno ocorre', async () => {
      authRepository.getTokenVerification.mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(service.resetPassword('token', 'nova_senha')).rejects.toThrow('Não foi possível redefinir a senha.');
    });
  });

  describe('resendVerification', () => {
    it('deve reenviar email de verificação com sucesso', async () => {
      const userData = createMockAccount();
      authRepository.getById.mockResolvedValue(userData);
      JWT.encodeToken.mockReturnValue('jwt_token');
      sendEmail.mockResolvedValue(undefined);

      await service.resendVerification('user123');

      expect(authRepository.getById).toHaveBeenCalledWith('user123');
      expect(JWT.encodeToken).toHaveBeenCalledWith({ id: 'user123' });
      expect(sendEmail).toHaveBeenCalled();
    });

    it('deve falhar quando usuário não existe', async () => {
      authRepository.getById.mockResolvedValue(null);

      await expect(service.resendVerification('user123')).rejects.toThrow('Usuário não encontrado.');
    });

    it('deve falhar quando envio de email falha', async () => {
      const userData = createMockAccount();
      authRepository.getById.mockResolvedValue(userData);
      JWT.encodeToken.mockReturnValue('jwt_token');
      sendEmail.mockRejectedValue(new Error('Email service error'));

      await expect(service.resendVerification('user123')).rejects.toThrow('Não foi possível enviar o email de confirmação.');
    });
  });
});
