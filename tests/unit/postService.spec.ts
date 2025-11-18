import PostService from '../../src/services/Post.services';
import { ThrowError } from '../../src/errors/ThrowError';
import { ObjectId } from 'mongodb';

// Mock dos repositórios e dependências
jest.mock('../../src/repositories/index', () => ({
  postRepository: {
    getPostsByAccount: jest.fn(),
    getPostsWithAuthor: jest.fn(),
    getPostWithAuthor: jest.fn(),
    getTopPosts: jest.fn(),
    getById: jest.fn(),
    addLike: jest.fn(),
    removeLike: jest.fn(),
    update: jest.fn(),
    getAll: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    search: jest.fn(),
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

jest.mock('../../src/Mappers/postMapper', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation((post) => ({
    id: post._id,
    content: post.content,
    account: post.account,
    likes: post.likes
  }))
}));

jest.mock('../../src/Mappers/postWithAuthorMapper', () => ({
  mapPostWithAuthor: jest.fn().mockImplementation((post) => ({
    ...post,
    id: post._id
  }))
}));

describe('PostService', () => {
  let service: PostService;

  const { postRepository } = require('../../src/repositories/index');
  const { PictureStorageRepository } = require('../../src/repositories/pictureStorage.repository');

  // Factory functions para dados de teste
  const createMockPost = (overrides?: any) => ({
    _id: new ObjectId(),
    id: new ObjectId().toString(),
    content: 'Post de teste',
    account: new ObjectId(),
    likes: [],
    image: [],
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
    // Suprimir console.log e console.error durante os testes para evitar ruído
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.clearAllMocks();
    // Resetar mocks do PictureStorageRepository
    PictureStorageRepository.uploadImage.mockResolvedValue(new ObjectId());
    PictureStorageRepository.deleteImage.mockResolvedValue(undefined);
    service = new PostService();
  });

  afterEach(() => {
    // Restaurar console.log e console.error após os testes
    jest.restoreAllMocks();
  });

  describe('getPostsByAccount', () => {
    it('deve retornar posts de uma conta com sucesso', async () => {
      // Arrange
      const posts = [
        createMockPost({ content: 'Post 1' }),
        createMockPost({ content: 'Post 2' })
      ];
      postRepository.getPostsByAccount.mockResolvedValue(posts);

      // Act
      const result = await service.getPostsByAccount('user123');

      // Assert
      expect(postRepository.getPostsByAccount).toHaveBeenCalledWith('user123');
      expect(result).toEqual(posts);
    });

    it('deve retornar array vazio quando não há posts', async () => {
      // Arrange
      postRepository.getPostsByAccount.mockResolvedValue([]);

      // Act
      const result = await service.getPostsByAccount('user123');

      // Assert
      expect(result).toEqual([]);
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
        {
          _id: 'post1',
          content: 'Post 1',
          account: {
            _id: 'user1',
            name: 'João',
            achievements: []
          }
        },
        {
          _id: 'post2',
          content: 'Post 2',
          account: {
            _id: 'user2',
            name: 'Maria',
            achievements: []
          }
        }
      ];
      postRepository.getPostsWithAuthor.mockResolvedValue(posts);

      // Act
      const result = await service.getPostsWithAuthor({});

      // Assert
      expect(postRepository.getPostsWithAuthor).toHaveBeenCalledWith({});
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('id', 'post1');
      expect(result[0].account).toHaveProperty('id', 'user1');
    });

    it('deve falhar quando erro interno ocorre', async () => {
      // Arrange
      postRepository.getPostsWithAuthor.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.getPostsWithAuthor({})).rejects.toThrow('Não foi possível buscar os posts.');
    });
  });

  describe('getPostWithAuthor', () => {
    it('deve retornar post com autor com sucesso', async () => {
      // Arrange
      const post = {
        _id: 'post1',
        content: 'Post 1',
        account: { _id: 'user1', name: 'João' }
      };
      postRepository.getPostWithAuthor.mockResolvedValue(post);

      // Act
      const result = await service.getPostWithAuthor('post1');

      // Assert
      expect(postRepository.getPostWithAuthor).toHaveBeenCalledWith('post1');
      expect(result).toHaveProperty('id', 'post1');
    });

    it('deve falhar quando erro interno ocorre', async () => {
      // Arrange
      postRepository.getPostWithAuthor.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.getPostWithAuthor('post1')).rejects.toThrow('Não foi possível buscar o post');
    });
  });

  describe('getTopPosts', () => {
    it('deve retornar top posts com sucesso', async () => {
      // Arrange
      const posts = [createMockPost(), createMockPost()];
      postRepository.getTopPosts.mockResolvedValue(posts);

      // Act
      const result = await service.getTopPosts();

      // Assert
      expect(postRepository.getTopPosts).toHaveBeenCalled();
      expect(result).toEqual(posts);
    });

    it('deve falhar quando erro interno ocorre', async () => {
      // Arrange
      postRepository.getTopPosts.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.getTopPosts()).rejects.toThrow('Não foi possível buscar os posts.');
    });
  });

  describe('toggleLike', () => {
    it('deve adicionar like quando usuário não curtiu', async () => {
      // Arrange
      const accountId = new ObjectId();
      const post = createMockPost({
        likes: []
      });
      const updatedPost = createMockPost({
        likes: [accountId]
      });
      postRepository.getById.mockResolvedValue(post);
      postRepository.addLike.mockResolvedValue(updatedPost);

      // Act
      const result = await service.toggleLike('post123', accountId.toString());

      // Assert
      expect(postRepository.getById).toHaveBeenCalledWith('post123');
      expect(postRepository.addLike).toHaveBeenCalledWith('post123', accountId.toString());
      expect(result).toHaveProperty('id');
    });

    it('deve remover like quando usuário já curtiu', async () => {
      // Arrange
      const accountId = new ObjectId();
      const mockEquals = jest.fn().mockReturnValue(true);
      const post = createMockPost({
        likes: [{ equals: mockEquals } as any]
      });
      const updatedPost = createMockPost({
        likes: []
      });
      postRepository.getById.mockResolvedValue(post);
      postRepository.removeLike.mockResolvedValue(updatedPost);

      // Act
      const result = await service.toggleLike('post123', accountId.toString());

      // Assert
      expect(postRepository.getById).toHaveBeenCalledWith('post123');
      expect(postRepository.removeLike).toHaveBeenCalledWith('post123', accountId.toString());
      expect(result).toHaveProperty('id');
    });

    it('deve retornar null quando postId é inválido', async () => {
      // Act
      const result = await service.toggleLike('', 'user123');

      // Assert
      expect(result).toBeNull();
      expect(postRepository.getById).not.toHaveBeenCalled();
    });

    it('deve retornar null quando accountId é inválido', async () => {
      // Act
      const result = await service.toggleLike('post123', '');

      // Assert
      expect(result).toBeNull();
      expect(postRepository.getById).not.toHaveBeenCalled();
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
      const post = createMockPost({ likes: [] });
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
      const updatedPost = createMockPost(updateData);
      postRepository.update.mockResolvedValue(updatedPost);

      // Act
      const result = await service.updateComment('post123', updateData);

      // Assert
      expect(postRepository.update).toHaveBeenCalledWith('post123', updateData);
      expect(result).toEqual(updatedPost);
    });

    it('deve falhar quando erro interno ocorre', () => {
      // Arrange
      postRepository.update.mockImplementation(() => {
        throw new Error('Database error');
      });

      // Act & Assert
      expect(() => service.updateComment('post123', { content: 'Novo comentário' }))
        .toThrow('Não foi possível atualizar o comentário.');
    });
  });

  describe('getAll', () => {
    it('deve retornar todos os posts com sucesso', async () => {
      // Arrange
      const posts = [createMockPost(), createMockPost()];
      postRepository.getAll.mockResolvedValue(posts);

      // Act
      const result = await service.getAll({});

      // Assert
      expect(postRepository.getAll).toHaveBeenCalledWith({});
      expect(result).toEqual(posts);
    });

    it('deve retornar array vazio quando não há posts', async () => {
      // Arrange
      postRepository.getAll.mockResolvedValue([]);

      // Act
      const result = await service.getAll({});

      // Assert
      expect(result).toEqual([]);
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
      const post = createMockPost();
      postRepository.getById.mockResolvedValue(post);

      // Act
      const result = await service.getById('post123');

      // Assert
      expect(postRepository.getById).toHaveBeenCalledWith('post123');
      expect(result).toHaveProperty('id');
    });

    it('deve retornar null quando post não existe', async () => {
      // Arrange
      postRepository.getById.mockResolvedValue(null);

      // Act
      const result = await service.getById('post123');

      // Assert
      expect(result).toBeNull();
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
      const createdPost = createMockPost({ ...postData, image: [] });
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
      const files = [createMockFile(), createMockFile()];
      const imageId1 = new ObjectId();
      const imageId2 = new ObjectId();
      const createdPost = createMockPost({ ...postData, image: [imageId1, imageId2] });
      
      PictureStorageRepository.uploadImage
        .mockResolvedValueOnce(imageId1)
        .mockResolvedValueOnce(imageId2);
      postRepository.create.mockResolvedValue(createdPost);

      // Act
      const result = await service.create(postData, files);

      // Assert
      expect(PictureStorageRepository.uploadImage).toHaveBeenCalledTimes(2);
      expect(postRepository.create).toHaveBeenCalledWith({
        ...postData,
        image: [imageId1, imageId2]
      });
      expect(result).toEqual(createdPost);
    }, 10000);

    it('deve ignorar arquivos que falharam no upload', async () => {
      // Arrange
      const postData = {
        content: 'Novo post',
        account: 'user123'
      };
      const files = [createMockFile(), createMockFile()];
      const imageId = new ObjectId();
      const createdPost = createMockPost({ ...postData, image: [imageId] });
      
      PictureStorageRepository.uploadImage
        .mockResolvedValueOnce(imageId)
        .mockResolvedValueOnce(null);
      postRepository.create.mockResolvedValue(createdPost);

      // Act
      const result = await service.create(postData, files);

      // Assert
      expect(PictureStorageRepository.uploadImage).toHaveBeenCalledTimes(2);
      expect(postRepository.create).toHaveBeenCalledWith({
        ...postData,
        image: [imageId]
      });
      expect(result).toEqual(createdPost);
    }, 10000);

    it('deve criar post sem arquivos quando array está vazio', async () => {
      // Arrange
      const postData = {
        content: 'Novo post',
        account: 'user123'
      };
      const createdPost = createMockPost({ ...postData, image: [] });
      postRepository.create.mockResolvedValue(createdPost);

      // Act
      const result = await service.create(postData, []);

      // Assert
      expect(PictureStorageRepository.uploadImage).not.toHaveBeenCalled();
      expect(postRepository.create).toHaveBeenCalledWith({
        ...postData,
        image: []
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
      const updatedPost = createMockPost(updateData);
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
      await expect(service.update('post123', { content: 'Post atualizado' }))
        .rejects.toThrow('Não foi possível atualizar o post.');
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

  describe('softDelete', () => {
    it('deve fazer soft delete do post com sucesso', async () => {
      // Arrange
      const accountId = new ObjectId();
      const post = createMockPost({ account: accountId });
      postRepository.getById.mockResolvedValue(post);
      postRepository.softDelete.mockResolvedValue(undefined);

      // Act
      const result = await service.softDelete('post123', accountId.toString());

      // Assert
      expect(postRepository.softDelete).toHaveBeenCalledWith('post123');
    });

    it('deve falhar quando post não existe', async () => {
      // Arrange
      postRepository.getById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.softDelete('post123', 'user123'))
        .rejects.toThrow('A publicação não foi encontrada.');
    });

    it('deve falhar quando post já foi deletado', async () => {
      // Arrange
      const post = createMockPost({ deletedAt: new Date() });
      postRepository.getById.mockResolvedValue(post);

      // Act & Assert
      await expect(service.softDelete('post123', 'user123'))
        .rejects.toThrow('A publicação já foi deletada.');
    });

    it('deve retornar null quando usuário não é proprietário', async () => {
      // Arrange
      const ownerId = new ObjectId();
      const userId = new ObjectId();
      const post = createMockPost({ account: ownerId });
      postRepository.getById.mockResolvedValue(post);

      // Act
      const result = await service.softDelete('post123', userId.toString());

      // Assert
      expect(result).toBeNull();
      expect(postRepository.softDelete).not.toHaveBeenCalled();
    });
  });

  describe('search', () => {
    it('deve buscar posts com filtros com sucesso', async () => {
      // Arrange
      const filter = { content: 'test' };
      const posts = [
        createMockPost({ content: 'Post de teste' }),
        createMockPost({ content: 'Outro post de teste' })
      ];
      postRepository.search.mockResolvedValue(posts);

      // Act
      const result = await service.search(filter);

      // Assert
      expect(postRepository.search).toHaveBeenCalledWith(filter);
      expect(result).toEqual(posts);
    });

    it('deve retornar array vazio quando não encontra resultados', async () => {
      // Arrange
      const filter = { content: 'inexistente' };
      postRepository.search.mockResolvedValue([]);

      // Act
      const result = await service.search(filter);

      // Assert
      expect(result).toEqual([]);
    });

    it('deve falhar quando erro interno ocorre', async () => {
      // Arrange
      postRepository.search.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.search({ content: 'test' })).rejects.toThrow('Não foi possível buscar os posts.');
    });
  });
});
