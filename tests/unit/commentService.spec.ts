import CommentService from '../../src/services/comment.services';
import { ObjectId } from 'mongodb';

jest.mock('../../src/repositories/index', () => ({
  commentRepository: {
    getReplies: jest.fn(),
    getByPostId: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    getAll: jest.fn(),
    softDelete: jest.fn()
  },
  postRepository: {
    getById: jest.fn()
  }
}));

jest.mock('../../src/services/index', () => ({
  accountService: {
    getById: jest.fn()
  }
}));

jest.mock('../../src/Mappers/commentsWithAuthorMapper', () => ({
  mapCommentsWithAuthor: jest.fn().mockImplementation((comment) => ({
    ...comment,
    id: comment._id || comment.id,
    account: comment.account ? {
      id: comment.account._id || comment.account.id,
      name: comment.account.name
    } : null
  }))
}));

describe('CommentService', () => {
  let service: CommentService;

  const { commentRepository, postRepository } = require('../../src/repositories/index');
  const { accountService } = require('../../src/services/index');
  const { mapCommentsWithAuthor } = require('../../src/Mappers/commentsWithAuthorMapper');

  const createMockComment = (overrides?: any) => ({
    _id: new ObjectId(),
    id: new ObjectId().toString(),
    content: 'Comentário de teste',
    account: new ObjectId(),
    post: new ObjectId(),
    parent: null,
    ...overrides
  });

  const createMockAccount = (overrides?: any) => ({
    id: 'user123',
    email: 'joao@test.com',
    name: 'João Silva',
    ...overrides
  });

  const createMockPost = (overrides?: any) => ({
    _id: new ObjectId(),
    id: new ObjectId().toString(),
    content: 'Post de teste',
    account: new ObjectId(),
    ...overrides
  });

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    service = new CommentService();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getReplies', () => {
    it('deve retornar respostas quando existem', async () => {
      const replies = [
        createMockComment({ parent: 'parent123' }),
        createMockComment({ parent: 'parent123' })
      ];
      commentRepository.getReplies.mockResolvedValue(replies);

      const result = await service.getReplies('parent123', {});

      expect(commentRepository.getReplies).toHaveBeenCalledWith('parent123', {});
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('account');
    });

    it('deve retornar array vazio quando não há respostas', async () => {
      commentRepository.getReplies.mockResolvedValue(null);

      const result = await service.getReplies('parent123', {});

      expect(result).toEqual([]);
    });

    it('deve falhar quando erro interno ocorre', async () => {
      commentRepository.getReplies.mockRejectedValue(new Error('Database error'));

      await expect(service.getReplies('parent123', {})).rejects.toThrow('Database error');
    });
  });

  describe('getAllByPost', () => {
    it('deve retornar comentários do post com sucesso', async () => {
      const comments = [
        createMockComment({ post: 'post123' }),
        createMockComment({ post: 'post123' })
      ];
      commentRepository.getByPostId.mockResolvedValue(comments);

      const result = await service.getAllByPost('post123', {});

      expect(commentRepository.getByPostId).toHaveBeenCalledWith('post123', {});
      expect(result).toHaveLength(2);
    });

    it('deve retornar array vazio quando não há comentários', async () => {
      commentRepository.getByPostId.mockResolvedValue([]);

      const result = await service.getAllByPost('post123', {});

      expect(result).toEqual([]);
    });

    it('deve falhar quando erro interno ocorre', async () => {
      commentRepository.getByPostId.mockRejectedValue(new Error('Database error'));

      await expect(service.getAllByPost('post123', {})).rejects.toThrow('Database error');
    });
  });

  describe('softDelete', () => {
    it('deve deletar comentário com sucesso quando usuário é proprietário', async () => {
      const accountId = new ObjectId().toString();
      const comment = createMockComment({ account: accountId });
      const deletedComment = { ...comment, deletedAt: new Date() };
      commentRepository.getById.mockResolvedValue(comment);
      commentRepository.softDelete.mockResolvedValue(deletedComment);

      const result = await service.softDelete(accountId, 'comment123');

      expect(commentRepository.getById).toHaveBeenCalledWith('comment123');
      expect(commentRepository.softDelete).toHaveBeenCalledWith(accountId, 'comment123');
      expect(result).toEqual(deletedComment);
    });

    it('deve falhar quando comentário não existe', async () => {
      commentRepository.getById.mockResolvedValue(null);

      await expect(service.softDelete('user123', 'comment123'))
        .rejects.toThrow('Comentário não encontrado.');
    });

    it('deve falhar quando usuário não é proprietário', async () => {
      const comment = createMockComment({ account: new ObjectId() });
      commentRepository.getById.mockResolvedValue(comment);

      await expect(service.softDelete('user123', 'comment123'))
        .rejects.toThrow('Acesso negado.');
    });

    it('deve falhar quando erro interno ocorre', async () => {
      commentRepository.getById.mockRejectedValue(new Error('Database error'));

      await expect(service.softDelete('user123', 'comment123'))
        .rejects.toThrow('Database error');
    });
  });

  describe('reply', () => {
    it('deve criar resposta com sucesso', async () => {
      const account = createMockAccount();
      const parentComment = createMockComment({ post: 'post123' });
      const post = createMockPost({ id: 'post123' });
      const replyData = {
        content: 'Resposta de teste',
        account: account.id,
        parent: 'parent123'
      };
      const createdReply = createMockComment({ ...replyData, post: 'post123' });
      accountService.getById.mockResolvedValue(account);
      commentRepository.getById.mockResolvedValue(parentComment);
      postRepository.getById.mockResolvedValue(post);
      commentRepository.create.mockResolvedValue(createdReply);

      const result = await service.reply(replyData);

      expect(accountService.getById).toHaveBeenCalledWith(account.id);
      expect(commentRepository.getById).toHaveBeenCalledWith('parent123');
      expect(postRepository.getById).toHaveBeenCalledWith('post123');
      expect(commentRepository.create).toHaveBeenCalledWith({
        ...replyData,
        post: 'post123'
      });
      expect(result).toEqual(createdReply);
    });

    it('deve falhar quando conta não existe', async () => {
      const replyData = {
        content: 'Resposta de teste',
        account: 'user123',
        parent: 'parent123'
      };
      accountService.getById.mockResolvedValue(null);

      await expect(service.reply(replyData))
        .rejects.toThrow('Conta associada ao comentário não existe.');
    });

    it('deve falhar quando comentário pai não é informado', async () => {
      const account = createMockAccount();
      const replyData = {
        content: 'Resposta de teste',
        account: account.id
      };
      accountService.getById.mockResolvedValue(account);

      await expect(service.reply(replyData as any))
        .rejects.toThrow('Comentário pai deve ser informado.');
    });

    it('deve falhar quando comentário pai não existe', async () => {
      const account = createMockAccount();
      const replyData = {
        content: 'Resposta de teste',
        account: account.id,
        parent: 'parent123'
      };
      accountService.getById.mockResolvedValue(account);
      commentRepository.getById.mockResolvedValue(null);

      await expect(service.reply(replyData))
        .rejects.toThrow('Comentário pai associado ao comentário não existe.');
    });

    it('deve falhar quando post não existe', async () => {
      const account = createMockAccount();
      const parentComment = createMockComment({ post: 'post123' });
      const replyData = {
        content: 'Resposta de teste',
        account: account.id,
        parent: 'parent123'
      };
      accountService.getById.mockResolvedValue(account);
      commentRepository.getById.mockResolvedValue(parentComment);
      postRepository.getById.mockResolvedValue(null);

      await expect(service.reply(replyData))
        .rejects.toThrow('Post associado ao comentário não existe.');
    });

    it('deve falhar quando erro interno ocorre', async () => {
      const account = createMockAccount();
      const replyData = {
        content: 'Resposta de teste',
        account: account.id,
        parent: 'parent123'
      };
      accountService.getById.mockRejectedValue(new Error('Database error'));

      await expect(service.reply(replyData))
        .rejects.toThrow('Database error');
    });
  });

  describe('create', () => {
    it('deve criar comentário com sucesso', async () => {
      const account = createMockAccount();
      const post = createMockPost();
      const commentData = {
        content: 'Comentário de teste',
        account: account.id,
        post: post.id
      };
      const createdComment = createMockComment(commentData);
      accountService.getById.mockResolvedValue(account);
      postRepository.getById.mockResolvedValue(post);
      commentRepository.create.mockResolvedValue(createdComment);

      const result = await service.create(commentData);

      expect(accountService.getById).toHaveBeenCalledWith(account.id);
      expect(postRepository.getById).toHaveBeenCalledWith(post.id);
      expect(commentRepository.create).toHaveBeenCalledWith(commentData);
      expect(result).toEqual(createdComment);
    });

    it('deve falhar quando conta não existe', async () => {
      const commentData = {
        content: 'Comentário de teste',
        account: 'user123',
        post: 'post123'
      };
      accountService.getById.mockResolvedValue(null);

      await expect(service.create(commentData))
        .rejects.toThrow('Conta não encontrada.');
    });

    it('deve falhar quando post não existe', async () => {
      const account = createMockAccount();
      const commentData = {
        content: 'Comentário de teste',
        account: account.id,
        post: 'post123'
      };
      accountService.getById.mockResolvedValue(account);
      postRepository.getById.mockResolvedValue(null);

      await expect(service.create(commentData))
        .rejects.toThrow('Post associado não existe.');
    });

    it('deve falhar quando erro interno ocorre', async () => {
      const account = createMockAccount();
      const commentData = {
        content: 'Comentário de teste',
        account: account.id,
        post: 'post123'
      };
      accountService.getById.mockRejectedValue(new Error('Database error'));

      await expect(service.create(commentData))
        .rejects.toThrow('Database error');
    });
  });

  describe('update', () => {
    it('deve atualizar comentário com sucesso quando usuário é proprietário', async () => {
      const accountId = new ObjectId().toString();
      const comment = createMockComment({ account: accountId });
      const updateData = {
        content: 'Comentário atualizado',
        account: accountId
      };
      const updatedComment = { ...comment, ...updateData };
      commentRepository.getById.mockResolvedValue(comment);
      commentRepository.update.mockResolvedValue(updatedComment);

      const result = await service.update('comment123', updateData);

      expect(commentRepository.getById).toHaveBeenCalledWith('comment123');
      expect(commentRepository.update).toHaveBeenCalledWith('comment123', updateData);
      expect(result).toEqual(updatedComment);
    });

    it('deve falhar quando comentário não existe', async () => {
      const updateData = {
        content: 'Comentário atualizado',
        account: 'user123'
      };
      commentRepository.getById.mockResolvedValue(null);

      await expect(service.update('comment123', updateData))
        .rejects.toThrow('Comentário não encontrado.');
    });

    it('deve falhar quando usuário não é proprietário', async () => {
      const comment = createMockComment({ account: new ObjectId() });
      const updateData = {
        content: 'Comentário atualizado',
        account: 'user123'
      };
      commentRepository.getById.mockResolvedValue(comment);

      await expect(service.update('comment123', updateData))
        .rejects.toThrow('Acesso negado.');
    });

    it('deve falhar quando erro interno ocorre', async () => {
      const updateData = {
        content: 'Comentário atualizado',
        account: 'user123'
      };
      commentRepository.getById.mockRejectedValue(new Error('Database error'));

      await expect(service.update('comment123', updateData))
        .rejects.toThrow('Database error');
    });
  });

  describe('delete', () => {
    it('deve deletar comentário com sucesso', async () => {
      commentRepository.delete.mockResolvedValue(undefined);

      await service.delete('comment123');

      expect(commentRepository.delete).toHaveBeenCalledWith('comment123');
    });

    it('deve falhar quando erro interno ocorre', async () => {
      commentRepository.delete.mockRejectedValue(new Error('Database error'));

      await expect(service.delete('comment123'))
        .rejects.toThrow('Database error');
    });
  });

  describe('getAll', () => {
    it('deve retornar todos os comentários com sucesso', async () => {
      const comments = [createMockComment(), createMockComment()];
      commentRepository.getAll.mockResolvedValue(comments);

      const result = await service.getAll({});

      expect(commentRepository.getAll).toHaveBeenCalledWith({});
      expect(result).toEqual(comments);
    });

    it('deve falhar quando erro interno ocorre', async () => {
      commentRepository.getAll.mockRejectedValue(new Error('Database error'));

      await expect(service.getAll({}))
        .rejects.toThrow('Database error');
    });
  });

  describe('getById', () => {
    it('deve retornar comentário quando existe', async () => {
      const comment = createMockComment();
      commentRepository.getById.mockResolvedValue(comment);

      const result = await service.getById('comment123');

      expect(commentRepository.getById).toHaveBeenCalledWith('comment123');
      expect(result).toEqual(comment);
    });

    it('deve retornar null quando comentário não existe', async () => {
      commentRepository.getById.mockResolvedValue(null);

      const result = await service.getById('comment123');

      expect(result).toBeNull();
    });

    it('deve falhar quando erro interno ocorre', async () => {
      commentRepository.getById.mockRejectedValue(new Error('Database error'));

      await expect(service.getById('comment123'))
        .rejects.toThrow('Database error');
    });
  });
});
