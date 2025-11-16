import { beforeEach, describe } from "node:test";
import { afterEach, expect, it, jest } from "@jest/globals";
import PostRepository from "@repositories/post.repository";
import { PictureStorageRepository } from "@repositories/pictureStorage.repository";
import PostService from "@services/post.services";
import { Types } from "mongoose";

jest.mock("../repositories/post.repository");
jest.mock("../repositories/pictureStorage.repository");

describe("PostService", () => {
    let postService: PostService;
    let postRepositoryMock: jest.Mocked<PostRepository>;
    let pictureStorageMock: jest.Mocked<typeof PictureStorageRepository>;

    beforeEach(() => {
        postRepositoryMock = new PostRepository() as jest.Mocked<PostRepository>;
        pictureStorageMock = PictureStorageRepository as jest.Mocked<typeof PictureStorageRepository>;

        postService = new PostService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("deve criar um post sem arquivos", async () => {
        const dto = { content: "Teste" } as any;
        postRepositoryMock.create.mockResolvedValue({ ...dto, _id: "123" } as any);

        const result = await postService.create(dto);

        expect(postRepositoryMock.create).toHaveBeenCalledWith({ ...dto, image: [] });
        expect(result._id).toBe("123");
    });

    it("deve criar um post com arquivos", async () => {
        const dto = { content: "Teste" } as any;
        const fakeFiles = [{ originalname: "img.png" }] as any;

        const fakeObjectId = new Types.ObjectId(); 

        pictureStorageMock.uploadImage.mockResolvedValue(fakeObjectId);
        postRepositoryMock.create.mockResolvedValue({
            ...dto,
            _id: new Types.ObjectId(),
            image: [fakeObjectId]
        } as any);

        const result = await postService.create(dto, fakeFiles);

        expect(pictureStorageMock.uploadImage).toHaveBeenCalledTimes(1);
        expect(postRepositoryMock.create).toHaveBeenCalledWith({
            ...dto,
            image: [fakeObjectId]
        });
        expect(result.image).toContain(fakeObjectId);
    });


    it("deve retornar post por ID", async () => {
        const fakePost = { _id: "123", content: "Teste" } as any;
        postRepositoryMock.getById.mockResolvedValue(fakePost);

        const result = await postService.getById("123");

        expect(postRepositoryMock.getById).toHaveBeenCalledWith("123");
        expect(result).toEqual(fakePost);
    });

    it("toggleLike deve adicionar like quando não há like", async () => {
        const fakePost = { _id: "123", likes: [] } as any;
        postRepositoryMock.getById.mockResolvedValue(fakePost);
        postRepositoryMock.addLike.mockResolvedValue({ ...fakePost, likes: ["user1"] } as any);

        const result = await postService.toggleLike("123", "user1");

        expect(postRepositoryMock.addLike).toHaveBeenCalledWith("123", "user1");
        expect(result?.likes).toContain("user1");
    });

    it("toggleLike deve remover like quando já existe", async () => {
        const fakePost = { _id: "123", likes: [{ equals: (id: string) => id === "user1" }] } as any;
        postRepositoryMock.getById.mockResolvedValue(fakePost);
        postRepositoryMock.removeLike.mockResolvedValue({ ...fakePost, likes: [] } as any);

        const result = await postService.toggleLike("123", "user1");

        expect(postRepositoryMock.removeLike).toHaveBeenCalledWith("123", "user1");
        expect(result?.likes).toHaveLength(0);
    });

    it("getAll deve retornar lista de posts", async () => {
        const fakePosts = [{ _id: "1" }, { _id: "2" }] as any;
        postRepositoryMock.getAll.mockResolvedValue(fakePosts);

        const result = await postService.getAll({} as any);

        expect(postRepositoryMock.getAll).toHaveBeenCalled();
        expect(result).toHaveLength(2);
    });
});