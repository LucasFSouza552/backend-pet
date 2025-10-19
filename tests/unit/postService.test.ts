import PostService from '../../src/services/Post.services';
import { ThrowError } from '../../src/errors/ThrowError';

// Mock dos repositórios e dependências
jest.mock('../../src/repositories/index', () => ({
  postRepository: {
    getPostsByAccount: jest.fn(),
    getPostsWithAuthor: jest.fn(),
    getById: jest.fn(),
    addLike: jest.fn(),
    removeLike: jest.fn(),
    update: jest.fn(),
    getAll: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    search: jest.fn()
  }
}));

jest.mock('../../src/repositories/PictureStorage.repository', () => ({
  PictureStorageRepository: {
    uploadImage: jest.fn(),
    deleteImage: jest.fn()
  }
}));

describe('PostService', () => {
  const service = new PostService();

  const { postRepository } = require('../../src/repositories/index');
  const { PictureStorageRepository } = require('../../src/repositories/PictureStorage.repository');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPostsByAccount', () => {
    it('deve retornar posts de uma conta com sucesso', async () => {
      // Arrange
      const posts = [
        { _id: 'post1', content: 'Post 1', account: 'user123' },
        { _id: 'post2', content: 'Post 2', account: 'user123' }
      ];
      postRepository.getPostsByAccount.mockResolvedValue(posts);

      // Act
      const result = await service.getPostsByAccount('user123');

      // Assert
      expect(postRepository.getPostsByAccount).toHaveBeenCalledWith('user123');
      expect(result).toEqual(posts);
    });

    it('deve falhar quando erro interno ocorre', async () => {
      // Arrange
      postRepository.getPostsByAccount.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.getPostsByAccount('user123')).rejects.toThrow('Não foi possível buscar os posts.');
    });
  });

  describe('getPostsWithAuthor', () => {
    it('deve retornar posts com autor com sucesso', async () => {
      // Arrange
      const posts = [
        { _id: 'post1', content: 'Post 1', author: { name: 'João' } },
        { _id: 'post2', content: 'Post 2', author: { name: 'Maria' } }
      ];
      postRepository.getPostsWithAuthor.mockResolvedValue(posts);

      // Act
      const result = await service.getPostsWithAuthor({});

      // Assert
      expect(postRepository.getPostsWithAuthor).toHaveBeenCalledWith({});
      expect(result).toEqual([
        { ...posts[0], id: 'post1' },
        { ...posts[1], id: 'post2' }
      ]);
    });

    it('deve falhar quando erro interno ocorre', async () => {
      // Arrange
      postRepository.getPostsWithAuthor.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.getPostsWithAuthor({})).rejects.toThrow('Não foi possível buscar os posts.');
    });
  });

  describe('toggleLike', () => {
    it('deve adicionar like quando usuário não curtiu', async () => {
      // Arrange
      const post = {
        _id: 'post123',
        content: 'Post 1',
        likes: [{ equals: jest.fn().mockReturnValue(false) }]
      };
      const updatedPost = {
        _id: 'post123',
        content: 'Post 1',
        likes: ['user123']
      };
      postRepository.getById.mockResolvedValue(post);
      postRepository.addLike.mockResolvedValue(updatedPost);

      // Act
      const result = await service.toggleLike('post123', 'user123');

      // Assert
      expect(postRepository.getById).toHaveBeenCalledWith('post123');
      expect(postRepository.addLike).toHaveBeenCalledWith('post123', 'user123');
      expect(result).toEqual(updatedPost);
    });

    it('deve remover like quando usuário já curtiu', async () => {
      // Arrange
      const post = {
        _id: 'post123',
        content: 'Post 1',
        likes: [{ equals: jest.fn().mockReturnValue(true) }]
      };
      const updatedPost = {
        _id: 'post123',
        content: 'Post 1',
        likes: []
      };
      postRepository.getById.mockResolvedValue(post);
      postRepository.removeLike.mockResolvedValue(updatedPost);

      // Act
      const result = await service.toggleLike('post123', 'user123');

      // Assert
      expect(postRepository.getById).toHaveBeenCalledWith('post123');
      expect(postRepository.removeLike).toHaveBeenCalledWith('post123', 'user123');
      expect(result).toEqual(updatedPost);
    });

    it('deve retornar null quando postId é inválido', async () => {
      // Act
      const result = await service.toggleLike('', 'user123');

      // Assert
      expect(result).toBeNull();
    });

    it('deve retornar null quando accountId é inválido', async () => {
      // Act
      const result = await service.toggleLike('post123', '');

      // Assert
      expect(result).toBeNull();
    });

    it('deve retornar null quando post não existe', async () => {
      // Arrange
      postRepository.getById.mockResolvedValue(null);

      // Act
      const result = await service.toggleLike('post123', 'user123');

      // Assert
      expect(result).toBeNull();
    });

    it('deve falhar quando erro interno ocorre', async () => {
      // Arrange
      const post = {
        _id: 'post123',
        content: 'Post 1',
        likes: []
      };
      postRepository.getById.mockResolvedValue(post);
      postRepository.addLike.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.toggleLike('post123', 'user123')).rejects.toThrow('Não foi possível curtir o post.');
    });
  });

  describe('updateComment', () => {
    it('deve atualizar comentário com sucesso', async () => {
      // Arrange
      const updateData = { content: 'Comentário atualizado' };
      const updatedPost = { _id: 'post123', content: 'Comentário atualizado' };
      postRepository.update.mockResolvedValue(updatedPost);

      // Act
      const result = await service.updateComment('post123', updateData);

      // Assert
      expect(postRepository.update).toHaveBeenCalledWith('post123', updateData);
      expect(result).toEqual(updatedPost);
    });

    it('deve falhar quando erro interno ocorre', async () => {
      // Arrange
      postRepository.update.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.updateComment('post123', { content: 'Novo comentário' })).rejects.toThrow('Não foi possível atualizar o comentário.');
    });
  });

  describe('getAll', () => {
    it('deve retornar todos os posts com sucesso', async () => {
      // Arrange
      const posts = [
        { _id: 'post1', content: 'Post 1' },
        { _id: 'post2', content: 'Post 2' }
      ];
      postRepository.getAll.mockResolvedValue(posts);

      // Act
      const result = await service.getAll({});

      // Assert
      expect(postRepository.getAll).toHaveBeenCalledWith({});
      expect(result).toEqual(posts);
    });

    it('deve falhar quando erro interno ocorre', async () => {
      // Arrange
      postRepository.getAll.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.getAll({})).rejects.toThrow('Não foi possível buscar os posts.');
    });
  });

  describe('getById', () => {
    it('deve retornar post quando existe', async () => {
      // Arrange
      const post = { _id: 'post123', content: 'Post 1' };
      postRepository.getById.mockResolvedValue(post);

      // Act
      const result = await service.getById('post123');

      // Assert
      expect(postRepository.getById).toHaveBeenCalledWith('post123');
      expect(result).toEqual(post);
    });

    it('deve falhar quando erro interno ocorre', async () => {
      // Arrange
      postRepository.getById.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.getById('post123')).rejects.toThrow('Não foi possível buscar o post.');
    });
  });

  describe('create', () => {
    it('deve criar post sem imagens com sucesso', async () => {
      // Arrange
      const postData = {
        content: 'Novo post',
        account: 'user123'
      };
      const createdPost = { _id: 'post123', ...postData, image: [] };
      postRepository.create.mockResolvedValue(createdPost);

      // Act
      const result = await service.create(postData);

      // Assert
      expect(postRepository.create).toHaveBeenCalledWith({
        ...postData,
        image: []
      });
      expect(result).toEqual(createdPost);
    });

    it('deve criar post com imagens com sucesso', async () => {
      // Arrange
      const postData = {
        content: 'Novo post',
        account: 'user123'
      };
      const files = [
        { buffer: Buffer.from('image1') },
        { buffer: Buffer.from('image2') }
      ] as Express.Multer.File[];
      const createdPost = { _id: 'post123', ...postData, image: ['img1', 'img2'] };
      PictureStorageRepository.uploadImage
        .mockResolvedValueOnce('img1')
        .mockResolvedValueOnce('img2');
      postRepository.create.mockResolvedValue(createdPost);

      // Act
      const result = await service.create(postData, files);

      // Assert
      expect(PictureStorageRepository.uploadImage).toHaveBeenCalledTimes(2);
      expect(postRepository.create).toHaveBeenCalledWith({
        ...postData,
        image: ['img1', 'img2']
      });
      expect(result).toEqual(createdPost);
    });

    it('deve ignorar arquivos que falharam no upload', async () => {
      // Arrange
      const postData = {
        content: 'Novo post',
        account: 'user123'
      };
      const files = [
        { buffer: Buffer.from('image1') },
        { buffer: Buffer.from('image2') }
      ] as Express.Multer.File[];
      const createdPost = { _id: 'post123', ...postData, image: ['img1'] };
      PictureStorageRepository.uploadImage
        .mockResolvedValueOnce('img1')
        .mockResolvedValueOnce(null); // falha no segundo upload
      postRepository.create.mockResolvedValue(createdPost);

      // Act
      const result = await service.create(postData, files);

      // Assert
      expect(PictureStorageRepository.uploadImage).toHaveBeenCalledTimes(2);
      expect(postRepository.create).toHaveBeenCalledWith({
        ...postData,
        image: ['img1']
      });
      expect(result).toEqual(createdPost);
    });

    it('deve falhar quando erro interno ocorre', async () => {
      // Arrange
      const postData = {
        content: 'Novo post',
        account: 'user123'
      };
      postRepository.create.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.create(postData)).rejects.toThrow('Não foi possível criar o post.');
    });
  });

  describe('update', () => {
    it('deve atualizar post com sucesso', async () => {
      // Arrange
      const updateData = { content: 'Post atualizado' };
      const updatedPost = { _id: 'post123', content: 'Post atualizado' };
      postRepository.update.mockResolvedValue(updatedPost);

      // Act
      const result = await service.update('post123', updateData);

      // Assert
      expect(postRepository.update).toHaveBeenCalledWith('post123', updateData);
      expect(result).toEqual(updatedPost);
    });

    it('deve falhar quando erro interno ocorre', async () => {
      // Arrange
      postRepository.update.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.update('post123', { content: 'Post atualizado' })).rejects.toThrow('Não foi possível atualizar o post.');
    });
  });

  describe('delete', () => {
    it('deve deletar post com sucesso', async () => {
      // Arrange
      postRepository.delete.mockResolvedValue(undefined);

      // Act
      await service.delete('post123');

      // Assert
      expect(postRepository.delete).toHaveBeenCalledWith('post123');
    });

    it('deve falhar quando erro interno ocorre', async () => {
      // Arrange
      postRepository.delete.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.delete('post123')).rejects.toThrow('Não foi possível deletar o post.');
    });
  });

  describe('search', () => {
    it('deve buscar posts com filtros com sucesso', async () => {
      // Arrange
      const filter = { content: 'test' };
      const posts = [
        { _id: 'post1', content: 'Post de teste' },
        { _id: 'post2', content: 'Outro post de teste' }
      ];
      postRepository.search.mockResolvedValue(posts);

      // Act
      const result = await service.search(filter);

      // Assert
      expect(postRepository.search).toHaveBeenCalledWith(filter);
      expect(result).toEqual(posts);
    });

    it('deve falhar quando erro interno ocorre', async () => {
      // Arrange
      postRepository.search.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.search({ content: 'test' })).rejects.toThrow('Não foi possível buscar os posts.');
    });
  });
});
