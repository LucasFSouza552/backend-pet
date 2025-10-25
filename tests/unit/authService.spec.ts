import AuthService from '../../src/services/Auth.services';
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

jest.mock('../../src/Mappers/accountMapper', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation((account: any) => ({
    id: account._id,
    email: account.email,
    name: account.name,
    verified: account.verified
  }))
}));

describe('AuthService', () => {
  const service = new AuthService();

  const { authRepository } = require('../../src/repositories/index');
  const { cryptPassword, validatePassword } = require('../../src/utils/aes-crypto');
  const { sendEmail } = require('../../src/utils/emailService');
  const JWT = require('../../src/utils/JwtEncoder');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getByEmail', () => {
    it('deve retornar usuário quando email existe', async () => {
      // Arrange
      const userData = { _id: 'user123', email: 'joao@test.com', name: 'João Silva' };
      authRepository.getByEmail.mockResolvedValue(userData);

      // Act
      const result = await service.getByEmail('joao@test.com');

      // Assert
      expect(authRepository.getByEmail).toHaveBeenCalledWith('joao@test.com');
      expect(result).toEqual(userData);
    });

    it('deve retornar null quando email não existe', async () => {
      // Arrange
      authRepository.getByEmail.mockResolvedValue(null);

      // Act
      const result = await service.getByEmail('inexistente@test.com');

      // Assert
      expect(result).toBeNull();
    });

    it('deve falhar quando erro interno ocorre', async () => {
      // Arrange
      authRepository.getByEmail.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.getByEmail('joao@test.com')).rejects.toThrow('Não foi possível buscar o usuário.');
    });
  });

  describe('changePassword', () => {
    const changePasswordData = {
      currentPassword: 'senha_atual',
      newPassword: 'nova_senha'
    };

    it('deve alterar senha com sucesso', async () => {
      // Arrange
      const userData = { _id: 'user123', password: 'hashed_current_password' };
      authRepository.getById.mockResolvedValue(userData);
      validatePassword.mockResolvedValue(true);
      cryptPassword.mockResolvedValue('hashed_new_password');
      authRepository.changePassword.mockResolvedValue(undefined);

      // Act
      await service.changePassword('user123', changePasswordData);

      // Assert
      expect(authRepository.getById).toHaveBeenCalledWith('user123');
      expect(validatePassword).toHaveBeenCalledWith('senha_atual', 'hashed_current_password');
      expect(cryptPassword).toHaveBeenCalledWith('nova_senha');
      expect(authRepository.changePassword).toHaveBeenCalledWith('user123', 'hashed_new_password');
    });

    it('deve falhar quando usuário não existe', async () => {
      // Arrange
      authRepository.getById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.changePassword('user123', changePasswordData)).rejects.toThrow('Usuário não encontrado.');
    });

    it('deve falhar quando senha atual está incorreta', async () => {
      // Arrange
      const userData = { _id: 'user123', password: 'hashed_current_password' };
      authRepository.getById.mockResolvedValue(userData);
      validatePassword.mockResolvedValue(false);

      // Act & Assert
      await expect(service.changePassword('user123', changePasswordData)).rejects.toThrow('As senhas não concidem.');
    });

    it('deve falhar quando erro interno ocorre', async () => {
      // Arrange
      authRepository.getById.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.changePassword('user123', changePasswordData)).rejects.toThrow('Não foi possível atualizar a senha.');
    });
  });

  describe('create', () => {
    const validUserData = {
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
      }
    };

    it('deve criar usuário com sucesso', async () => {
      // Arrange
      authRepository.getByEmail.mockResolvedValue(null);
      authRepository.getByCpf.mockResolvedValue(null);
      authRepository.getByCnpj.mockResolvedValue(null);
      cryptPassword.mockResolvedValue('hashed_password');
      authRepository.create.mockResolvedValue({ _id: 'user123', ...validUserData });
      JWT.encodeToken.mockReturnValue('jwt_token');
      sendEmail.mockResolvedValue(undefined);

      // Act
      const result = await service.create(validUserData);

      // Assert
      expect(authRepository.getByEmail).toHaveBeenCalledWith(validUserData.email);
      expect(authRepository.getByCpf).toHaveBeenCalledWith(validUserData.cpf);
      expect(cryptPassword).toHaveBeenCalledWith(validUserData.password);
      expect(JWT.encodeToken).toHaveBeenCalledWith({ id: 'user123' });
      expect(sendEmail).toHaveBeenCalled();
      expect(result).toEqual({
        id: 'user123',
        email: validUserData.email,
        name: validUserData.name,
        verified: undefined
      });
    });

    it('deve falhar quando email já existe', async () => {
      // Arrange
      authRepository.getByEmail.mockResolvedValue({ _id: 'existing_user', email: validUserData.email });

      // Act & Assert
      await expect(service.create(validUserData)).rejects.toThrow('E-mail já cadastrado.');
      expect(authRepository.create).not.toHaveBeenCalled();
    });

    it('deve falhar quando CPF já existe', async () => {
      // Arrange
      authRepository.getByEmail.mockResolvedValue(null);
      authRepository.getByCpf.mockResolvedValue({ _id: 'existing_user', cpf: validUserData.cpf });

      // Act & Assert
      await expect(service.create(validUserData)).rejects.toThrow('CPF já cadastrado.');
    });

    it('deve falhar quando CNPJ já existe', async () => {
      // Arrange
      const institutionData = { ...validUserData, cnpj: '12345678901234', cpf: undefined };
      authRepository.getByEmail.mockResolvedValue(null);
      authRepository.getByCnpj.mockResolvedValue({ _id: 'existing_institution', cnpj: institutionData.cnpj });

      // Act & Assert
      await expect(service.create(institutionData)).rejects.toThrow('CNPJ já cadastrado.');
    });

    it('deve falhar quando envio de email falha', async () => {
      // Arrange
      authRepository.getByEmail.mockResolvedValue(null);
      authRepository.getByCpf.mockResolvedValue(null);
      authRepository.getByCnpj.mockResolvedValue(null);
      cryptPassword.mockResolvedValue('hashed_password');
      authRepository.create.mockResolvedValue({ _id: 'user123', ...validUserData });
      JWT.encodeToken.mockReturnValue('jwt_token');
      sendEmail.mockRejectedValue(new Error('Email service error'));

      // Act & Assert
      await expect(service.create(validUserData)).rejects.toThrow('Não foi possível enviar o email de confirmação.');
    });

    it('deve falhar quando erro interno ocorre', async () => {
      // Arrange
      authRepository.getByEmail.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.create(validUserData)).rejects.toThrow('Não foi possível criar o usuário.');
    });
  });

  describe('verifyEmail', () => {
    it('deve verificar email com sucesso', async () => {
      // Arrange
      const token = 'valid_token';
      const decodedToken = { data: { id: 'user123' } };
      const userData = { _id: 'user123', email: 'joao@test.com', verified: false };
      JWT.isJwtTokenValid.mockReturnValue(decodedToken);
      authRepository.getById.mockResolvedValue(userData);
      authRepository.updateVerificationToken.mockResolvedValue({ ...userData, verified: true });

      // Act
      const result = await service.verifyEmail(token);

      // Assert
      expect(JWT.isJwtTokenValid).toHaveBeenCalledWith(token);
      expect(authRepository.getById).toHaveBeenCalledWith('user123');
      expect(authRepository.updateVerificationToken).toHaveBeenCalledWith({
        ...userData,
        verified: true
      });
      expect(result).toEqual({
        id: 'user123',
        email: 'joao@test.com',
        name: undefined,
        verified: true
      });
    });

    it('deve falhar quando token está vazio', async () => {
      // Act & Assert
      await expect(service.verifyEmail('')).rejects.toThrow('Usuário não encontrado.');
    });

    it('deve falhar quando token é inválido', async () => {
      // Arrange
      JWT.isJwtTokenValid.mockReturnValue(null);

      // Act & Assert
      await expect(service.verifyEmail('invalid_token')).rejects.toThrow('Token inválido.');
    });

    it('deve falhar quando usuário não existe', async () => {
      // Arrange
      const token = 'valid_token';
      const decodedToken = { data: { id: 'user123' } };
      JWT.isJwtTokenValid.mockReturnValue(decodedToken);
      authRepository.getById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.verifyEmail(token)).rejects.toThrow('Usuário não encontrado.');
    });

    it('deve falhar quando atualização de verificação falha', async () => {
      // Arrange
      const token = 'valid_token';
      const decodedToken = { data: { id: 'user123' } };
      const userData = { _id: 'user123', email: 'joao@test.com', verified: false };
      JWT.isJwtTokenValid.mockReturnValue(decodedToken);
      authRepository.getById.mockResolvedValue(userData);
      authRepository.updateVerificationToken.mockResolvedValue(null);

      // Act & Assert
      await expect(service.verifyEmail(token)).rejects.toThrow('Usuário não encontrado.');
    });

    it('deve falhar quando erro interno ocorre', async () => {
      // Arrange
      JWT.isJwtTokenValid.mockRejectedValue(new Error('JWT error'));

      // Act & Assert
      await expect(service.verifyEmail('token')).rejects.toThrow('Nao foi possivel buscar o usuario.');
    });
  });

  describe('forgotPassword', () => {
    it('deve enviar email de recuperação com sucesso', async () => {
      // Arrange
      const email = 'joao@test.com';
      const userData = { _id: 'user123', email };
      authRepository.getByEmail.mockResolvedValue(userData);
      JWT.encodeToken.mockReturnValue('jwt_token');
      sendEmail.mockResolvedValue(undefined);

      // Act
      await service.forgotPassword(email);

      // Assert
      expect(authRepository.getByEmail).toHaveBeenCalledWith(email);
      expect(JWT.encodeToken).toHaveBeenCalledWith({ id: 'user123' });
      expect(sendEmail).toHaveBeenCalledWith({
        to: email,
        subject: '🔒 Recuperação de Senha - MyPets',
        text: expect.stringContaining('jwt_token'),
        html: expect.stringContaining('jwt_token')
      });
    });

    it('deve falhar quando usuário não existe', async () => {
      // Arrange
      authRepository.getByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(service.forgotPassword('inexistente@test.com')).rejects.toThrow('Usuário não encontrado.');
    });

    it('deve falhar quando envio de email falha', async () => {
      // Arrange
      const email = 'joao@test.com';
      const userData = { _id: 'user123', email };
      authRepository.getByEmail.mockResolvedValue(userData);
      JWT.encodeToken.mockReturnValue('jwt_token');
      sendEmail.mockRejectedValue(new Error('Email service error'));

      // Act & Assert
      await expect(service.forgotPassword(email)).rejects.toThrow('Não foi possivel enviar o email.');
    });

    it('deve falhar quando erro interno ocorre', async () => {
      // Arrange
      authRepository.getByEmail.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.forgotPassword('joao@test.com')).rejects.toThrow('Não foi possível redefinir a senha.');
    });
  });

  describe('resetPassword', () => {
    it('deve redefinir senha com sucesso', async () => {
      // Arrange
      const token = 'valid_token';
      const password = 'nova_senha';
      const decodedToken = { data: { id: 'user123' } };
      const userData = { _id: 'user123', password: 'old_hashed_password' };
      authRepository.getTokenVerification.mockResolvedValue({ token });
      JWT.isJwtTokenValid.mockReturnValue(decodedToken);
      authRepository.getById.mockResolvedValue(userData);
      cryptPassword.mockResolvedValue('new_hashed_password');
      authRepository.changePassword.mockResolvedValue(undefined);

      // Act
      await service.resetPassword(token, password);

      // Assert
      expect(authRepository.getTokenVerification).toHaveBeenCalledWith(token);
      expect(JWT.isJwtTokenValid).toHaveBeenCalledWith(token);
      expect(authRepository.getById).toHaveBeenCalledWith('user123');
      expect(cryptPassword).toHaveBeenCalledWith(password);
      expect(authRepository.changePassword).toHaveBeenCalledWith('user123', 'new_hashed_password');
    });

    it('deve falhar quando token de verificação não existe', async () => {
      // Arrange
      authRepository.getTokenVerification.mockResolvedValue(null);

      // Act & Assert
      await expect(service.resetPassword('invalid_token', 'nova_senha')).rejects.toThrow('Token inválido.');
    });

    it('deve falhar quando token JWT é inválido', async () => {
      // Arrange
      authRepository.getTokenVerification.mockResolvedValue({ token: 'valid_token' });
      JWT.isJwtTokenValid.mockReturnValue(null);

      // Act & Assert
      await expect(service.resetPassword('invalid_token', 'nova_senha')).rejects.toThrow('Token inválido.');
    });

    it('deve falhar quando ID do usuário não está no token', async () => {
      // Arrange
      const token = 'valid_token';
      const decodedToken = { data: {} };
      authRepository.getTokenVerification.mockResolvedValue({ token });
      JWT.isJwtTokenValid.mockReturnValue(decodedToken);

      // Act & Assert
      await expect(service.resetPassword(token, 'nova_senha')).rejects.toThrow('Token inválido.');
    });

    it('deve falhar quando usuário não existe', async () => {
      // Arrange
      const token = 'valid_token';
      const decodedToken = { data: { id: 'user123' } };
      authRepository.getTokenVerification.mockResolvedValue({ token });
      JWT.isJwtTokenValid.mockReturnValue(decodedToken);
      authRepository.getById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.resetPassword(token, 'nova_senha')).rejects.toThrow('Usuário não encontrado.');
    });

    it('deve falhar quando erro interno ocorre', async () => {
      // Arrange
      authRepository.getTokenVerification.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.resetPassword('token', 'nova_senha')).rejects.toThrow('Não foi possível redefinir a senha.');
    });
  });
});
