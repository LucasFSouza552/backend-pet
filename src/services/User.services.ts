import { updateUserDTO } from "../dtos/UserDTO";
import { ThrowError } from "../errors/ThrowError";
import Filter from "../interfaces/Filter";
import IService from "../interfaces/IService";
import { IUser } from "../models/User";
import UserRepository from "../repositories/User.repository";
import { cryptPassword } from "../utils/aes-crypto";

const userRepository = new UserRepository();

export class UserService implements IService<IUser> {
    async getAll(filter: Filter): Promise<IUser[]> {
        try {
            return userRepository.getAll(filter);
        } catch (error: any) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Não foi possível listar os usuários.");
        }
    }
    async getById(id: string): Promise<IUser> {
        try {
            return await userRepository.getById(id);
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Não foi possível listar o usuário.");
        }
    }
    async create(data: IUser): Promise<IUser> {
        try {
            const user = await userRepository.getByEmail(data.email);
            if (user) throw ThrowError.conflict("E-mail ja cadastrado.");

            data.password = await cryptPassword(data.password);

            return await userRepository.create(data);
        } catch (error: any) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Não foi possível criar o usuário.");
        }
    }
    async update(id: string, data: updateUserDTO): Promise<IUser> {
        try {
            return await userRepository.update(id, data);
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Não foi possível atualizar o usuário.");
        }
    }
    async delete(id: string): Promise<void> {
        try {
            await userRepository.delete(id);
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Não foi possível deletar o usuário.");
        }
    }

    async getByEmail(email: string): Promise<IUser | null> {
        try {
            return await userRepository.getByEmail(email);
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Não foi possível buscar o usuário.");
        }
    }

}