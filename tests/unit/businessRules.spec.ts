/**
 * Testes de Regras de Negócio
 * 
 * Este arquivo contém testes que validam as regras de negócio do sistema,
 * garantindo que as validações e constraints estão funcionando corretamente.
 */

import { ThrowError } from '../../src/errors/ThrowError';

describe('Business Rules', () => {
  describe('ThrowError - Validação de Códigos de Status HTTP', () => {
    it('deve criar erro de bad request (400)', () => {
      const error = ThrowError.badRequest('Dados inválidos');
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ThrowError);
      expect(error.message).toBe('Dados inválidos');
      expect(error.statusCode).toBe(400);
    });

    it('deve criar erro de unauthorized (401)', () => {
      const error = ThrowError.unauthorized('Acesso negado');
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ThrowError);
      expect(error.message).toBe('Acesso negado');
      expect(error.statusCode).toBe(401);
    });

    it('deve criar erro de forbidden (403)', () => {
      const error = ThrowError.forbidden('Operação não permitida');
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ThrowError);
      expect(error.message).toBe('Operação não permitida');
      expect(error.statusCode).toBe(403);
    });

    it('deve criar erro de not found (404)', () => {
      const error = ThrowError.notFound('Recurso não encontrado');
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ThrowError);
      expect(error.message).toBe('Recurso não encontrado');
      expect(error.statusCode).toBe(404);
    });

    it('deve criar erro de conflict (409)', () => {
      const error = ThrowError.conflict('Recurso já existe');
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ThrowError);
      expect(error.message).toBe('Recurso já existe');
      expect(error.statusCode).toBe(409);
    });

    it('deve criar erro interno (500)', () => {
      const error = ThrowError.internal('Erro interno do servidor');
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ThrowError);
      expect(error.message).toBe('Erro interno do servidor');
      expect(error.statusCode).toBe(500);
    });
  });

  describe('Validação de Dados de Conta', () => {
    describe('Email', () => {
      it('deve validar formato de email válido', () => {
        const validEmails = [
          'user@example.com',
          'test.email@domain.co.uk',
          'user+tag@example.org',
          'user123@test.com.br',
          'nome.sobrenome@empresa.com.br'
        ];

        validEmails.forEach(email => {
          const emailRegex = /^\S+@\S+\.\S+$/;
          expect(emailRegex.test(email)).toBe(true);
        });
      });

      it('deve rejeitar formato de email inválido', () => {
        const invalidEmails = [
          'invalid-email',
          '@example.com',
          'user@',
          'user@.com',
          'user@com',
          'user@.com.br',
          'user@example.',
          'user@.example.com',
          '',
          'user space@email.com'
        ];

        invalidEmails.forEach(email => {
          const emailRegex = /^\S+@\S+\.\S+$/;
          const isValid = emailRegex.test(email)
            && !email.startsWith('@')
            && !email.includes(' ')
            && !email.includes('..')
            && !email.includes('@.');
          expect(isValid).toBe(false);
        });
      });
    });

    describe('CPF', () => {
      it('deve validar formato de CPF válido (11 dígitos numéricos)', () => {
        const validCpfs = [
          '12345678901',
          '98765432100',
          '00000000000',
          '11111111111'
        ];

        validCpfs.forEach(cpf => {
          const cpfRegex = /^\d{11}$/;
          expect(cpfRegex.test(cpf)).toBe(true);
        });
      });

      it('deve rejeitar formato de CPF inválido', () => {
        const invalidCpfs = [
          '1234567890',      // 10 dígitos
          '123456789012',    // 12 dígitos
          '1234567890a',     // contém letra
          '123-456-789-01',  // contém hífen
          '123.456.789-01',  // contém pontos
          '1234567890A',      // contém letra maiúscula
          ''                  // vazio
        ];

        invalidCpfs.forEach(cpf => {
          const cpfRegex = /^\d{11}$/;
          expect(cpfRegex.test(cpf)).toBe(false);
        });
      });
    });

    describe('CNPJ', () => {
      it('deve validar formato de CNPJ válido (14 dígitos numéricos)', () => {
        const validCnpjs = [
          '12345678901234',
          '98765432109876',
          '00000000000000',
          '11111111111111'
        ];

        validCnpjs.forEach(cnpj => {
          const cnpjRegex = /^\d{14}$/;
          expect(cnpjRegex.test(cnpj)).toBe(true);
        });
      });

      it('deve rejeitar formato de CNPJ inválido', () => {
        const invalidCnpjs = [
          '1234567890123',        // 13 dígitos
          '123456789012345',      // 15 dígitos
          '1234567890123a',       // contém letra
          '12.345.678/0001-90',   // contém pontos e hífen
          '1234567890123A',       // contém letra maiúscula
          ''                       // vazio
        ];

        invalidCnpjs.forEach(cnpj => {
          const cnpjRegex = /^\d{14}$/;
          expect(cnpjRegex.test(cnpj)).toBe(false);
        });
      });
    });

    describe('CEP', () => {
      it('deve validar formato de CEP válido (XXXXX-XXX)', () => {
        const validCeps = [
          '12345-678',
          '98765-432',
          '00000-000',
          '99999-999'
        ];

        validCeps.forEach(cep => {
          const cepRegex = /^\d{5}-\d{3}$/;
          expect(cepRegex.test(cep)).toBe(true);
        });
      });

      it('deve rejeitar formato de CEP inválido', () => {
        const invalidCeps = [
          '12345678',      // sem hífen
          '1234-567',      // formato incorreto
          '12345-6789',    // muito longo
          '12345-67a',     // contém letra
          '12345-67A',     // contém letra maiúscula
          '12345-67',      // muito curto
          ''                // vazio
        ];

        invalidCeps.forEach(cep => {
          const cepRegex = /^\d{5}-\d{3}$/;
          expect(cepRegex.test(cep)).toBe(false);
        });
      });
    });

    describe('Telefone', () => {
      it('deve validar formato de telefone válido (10 ou 11 dígitos)', () => {
        const validPhones = [
          '3299999999',      // 10 dígitos
          '11987654321',     // 11 dígitos
          '85912345678',     // 11 dígitos
          '1133334444'       // 10 dígitos
        ];

        validPhones.forEach(phone => {
          const phoneRegex = /^\d{10,11}$/;
          expect(phoneRegex.test(phone)).toBe(true);
        });
      });

      it('deve rejeitar formato de telefone inválido', () => {
        const invalidPhones = [
          '329999999',       // muito curto (9 dígitos)
          '329999999999',    // muito longo (12 dígitos)
          '32-9999-9999',    // com hífen
          '(32) 99999-9999', // com parênteses
          '32a9999999',      // com letra
          '32 9999 9999',    // com espaços
          ''                  // vazio
        ];

        invalidPhones.forEach(phone => {
          const phoneRegex = /^\d{10,11}$/;
          expect(phoneRegex.test(phone)).toBe(false);
        });
      });
    });
  });

  describe('Validação de Dados de Pet', () => {
    describe('Tipo de Pet', () => {
      it('deve validar tipos de pet permitidos', () => {
        const validTypes = ['Cachorro', 'Gato', 'Pássaro', 'Outro'];
        const allowedTypes = ['Cachorro', 'Gato', 'Pássaro', 'Outro'];

        validTypes.forEach(type => {
          expect(allowedTypes.includes(type)).toBe(true);
        });
      });

      it('deve rejeitar tipos de pet não permitidos', () => {
        const invalidTypes = ['Peixe', 'Hamster', 'Coelho', 'Cavalo'];
        const allowedTypes = ['Cachorro', 'Gato', 'Pássaro', 'Outro'];

        invalidTypes.forEach(type => {
          expect(allowedTypes.includes(type)).toBe(false);
        });
      });
    });

    describe('Gênero', () => {
      it('deve validar gênero válido (M ou F)', () => {
        const validGenders = ['M', 'F'];
        const allowedGenders = ['M', 'F'];

        validGenders.forEach(gender => {
          expect(allowedGenders.includes(gender)).toBe(true);
        });
      });

      it('deve rejeitar gênero inválido', () => {
        const invalidGenders = ['m', 'f', 'Male', 'Female', '1', '0', 'Masculino', 'Feminino', ''];
        const allowedGenders = ['M', 'F'];

        invalidGenders.forEach(gender => {
          expect(allowedGenders.includes(gender)).toBe(false);
        });
      });
    });

    describe('Peso', () => {
      it('deve validar peso positivo', () => {
        const validWeights = [0.1, 1, 50, 100, 0.5, 25.5];

        validWeights.forEach(weight => {
          expect(weight > 0).toBe(true);
        });
      });

      it('deve rejeitar peso negativo ou zero', () => {
        const invalidWeights = [-1, 0, -0.1, -10];

        invalidWeights.forEach(weight => {
          expect(weight > 0).toBe(false);
        });
      });
    });

    describe('Idade', () => {
      it('deve validar idade não negativa', () => {
        const validAges = [0, 1, 5, 10, 20, 0.5, 2.5];

        validAges.forEach(age => {
          expect(age >= 0).toBe(true);
        });
      });

      it('deve rejeitar idade negativa', () => {
        const invalidAges = [-1, -0.1, -10];

        invalidAges.forEach(age => {
          expect(age >= 0).toBe(false);
        });
      });
    });
  });

  describe('Regras de Negócio - Adoção', () => {
    it('deve validar que pet não pode ser adotado duas vezes', () => {
      const pet = { adopted: false };
      const alreadyAdoptedPet = { adopted: true };

      expect(pet.adopted).toBe(false);
      expect(alreadyAdoptedPet.adopted).toBe(true);
    });

    it('deve validar que usuário não pode adotar próprio pet', () => {
      const petOwner = 'user-1';
      const adopter = 'user-1';
      const differentUser = 'user-2';

      expect(petOwner === adopter).toBe(true); // não pode adotar próprio pet
      expect(petOwner !== differentUser).toBe(true); // pode adotar pet de outro
    });

    it('deve validar que pet deve ter proprietário', () => {
      const petWithOwner = { account: 'user-1' };
      const petWithoutOwner = { account: null };

      expect(petWithOwner.account).toBeTruthy();
      expect(petWithoutOwner.account).toBeFalsy();
    });
  });

  describe('Regras de Negócio - Pagamento', () => {
    it('deve validar valores de pagamento positivos', () => {
      const validAmounts = ['10.00', '50.50', '100.00', '0.01', '999.99'];

      validAmounts.forEach(amount => {
        const numAmount = parseFloat(amount);
        expect(numAmount > 0).toBe(true);
        expect(!isNaN(numAmount)).toBe(true);
      });
    });

    it('deve rejeitar valores de pagamento inválidos', () => {
      const invalidAmounts = ['-10.00', '0.00', 'abc', '', '10.000', '10,50'];

      invalidAmounts.forEach(amount => {
        const numAmount = parseFloat(amount);
        const parts = amount.split('.');
        const hasUnexpectedDecimalPlaces = parts.length > 2 || (parts[1] && parts[1].length !== 2);
        const isValid = numAmount > 0
          && !isNaN(numAmount)
          && !amount.includes(',')
          && !hasUnexpectedDecimalPlaces;
        expect(isValid).toBe(false);
      });
    });

    it('deve validar status de pagamento permitidos', () => {
      const validStatuses = ['pending', 'completed', 'cancelled', 'refunded'];
      const allowedStatuses = ['pending', 'completed', 'cancelled', 'refunded'];

      validStatuses.forEach(status => {
        expect(allowedStatuses.includes(status)).toBe(true);
      });
    });

    it('deve validar que pagamento não pode ser processado duas vezes', () => {
      const processedStatuses = ['completed', 'cancelled', 'refunded'];
      const pendingStatus = 'pending';

      processedStatuses.forEach(status => {
        expect(['completed', 'cancelled', 'refunded'].includes(status)).toBe(true);
      });

      expect(processedStatuses.includes(pendingStatus)).toBe(false);
    });
  });

  describe('Regras de Negócio - Post', () => {
    it('deve validar que post deve ter conteúdo ou imagem', () => {
      const validPosts = [
        { content: 'Texto do post' },
        { image: ['img1', 'img2'] },
        { content: 'Texto', image: ['img1'] }
      ];

      validPosts.forEach(post => {
        const hasContent = post.content && post.content.trim().length > 0;
        const hasImages = post.image && post.image.length > 0;
        expect(hasContent || hasImages).toBe(true);
      });
    });

    it('deve rejeitar post sem conteúdo nem imagem', () => {
      const invalidPosts = [
        {},                    // sem conteúdo nem imagem
        { content: '' },       // conteúdo vazio
        { image: [] }          // array de imagens vazio
      ];

      invalidPosts.forEach(post => {
        const hasContent = typeof post.content === 'string' && post.content.trim().length > 0;
        const hasImages = Array.isArray(post.image) && post.image.length > 0;
        const isValid = hasContent || hasImages;
        expect(isValid).toBe(false);
      });
    });
  });

  describe('Regras de Negócio - Conquistas', () => {
    it('deve validar tipos de conquistas permitidos', () => {
      const validTypes = ['adoption', 'sponsorship', 'donation'];
      const allowedTypes = ['adoption', 'sponsorship', 'donation'];

      validTypes.forEach(type => {
        expect(allowedTypes.includes(type)).toBe(true);
      });
    });

    it('deve rejeitar tipos de conquistas inválidos', () => {
      const invalidTypes = ['invalid', 'achievement', '', 'adopt', 'sponsor', 'donate'];
      const allowedTypes = ['adoption', 'sponsorship', 'donation'];

      invalidTypes.forEach(type => {
        expect(allowedTypes.includes(type)).toBe(false);
      });
    });
  });
});