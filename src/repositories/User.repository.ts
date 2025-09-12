import { FilterQuery } from "mongoose";
import Filter from "../interfaces/Filter";
import IRepository from "../interfaces/IRepository";
import { IUser, User } from "../models/User";
import { ThrowError } from "../errors/ThrowError";
import { updateUserDTO } from "../dtos/UserDTO";

export default class UserRepository implements IRepository<IUser> {
    async getAll(filter: Filter): Promise<IUser[]> {
        try {
            const { page, limit, orderBy, order, query } = filter;

            return await User.find(query as FilterQuery<IUser>)
                .sort({ [orderBy]: order })
                .skip((page - 1) * limit)
                .limit(limit);

        } catch (error: any) {
            throw ThrowError.internal("Erro ao buscar usuários.");
        }
    }
    async getById(id: string): Promise<IUser> {
        try {
            const user = await User.findById(id);
            if (!user) {
                throw ThrowError.notFound("Usuário não encontrado.");
            }
            return user;
        } catch (error) {
            throw ThrowError.internal("Erro ao buscar usuário.");
        }
    }
    async create(data: IUser): Promise<IUser> {
        try {
            const user = new User(data);
            await user.save();
            return user;
        } catch (error: any) {
            if (error.name === "ValidationError") {
                throw ThrowError.badRequest("Dados inválidos: " + error.message);
            }

            if (error.code === 11000) {
                throw ThrowError.conflict("E-mail já está em uso.");
            }

            throw ThrowError.internal("Erro ao criar usuário.");
        }
    }
    async update(id: string, data: updateUserDTO): Promise<IUser> {
        try {
            const user = await User.findById(id);
            if (!user) {
                throw ThrowError.notFound("Usuário não encontrado.");
            }
            const updatedUser = await User.findByIdAndUpdate(id, data, {
                new: true,
                runValidators: true
            });
            if (!updatedUser) {
                throw ThrowError.internal("Erro ao atualizar usuário.");
            }
            return updatedUser;
        } catch (error: any) {

            if (error.name === "CastError") {
                throw ThrowError.badRequest("ID inválido.");
            }

            if (error.name === "ValidationError") {
                throw ThrowError.badRequest("Dados inválidos: " + error.message);
            }

            if (error.code === 11000) {
                throw ThrowError.conflict("E-mail já está em uso.");
            }
            throw ThrowError.internal("Erro ao atualizar usuário.");
        }
    }
    async delete(id: string): Promise<void> {
        try {
            const user = await User.findByIdAndDelete(id);
            if (!user) {
                throw ThrowError.notFound("Usuário não encontrado.");
            }
        } catch (error) {
            throw ThrowError.internal("Erro ao deletar usuário.");
        }
    }

    async getByEmail(email: string): Promise<IUser | null> {
        try {
            return await User.findOne({ email });
        } catch (error) {
            throw ThrowError.internal("Erro ao buscar usuário por e-mail.");
        }
    }

};