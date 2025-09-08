import { Request, Response, NextFunction } from "express";
import IController from "../interfaces/IController";
import { ThrowError } from "../errors/ThrowError";
import { UserService } from "../services/User.services";
import Filter from "../interfaces/Filter";
import filterConfig from "../utils/filterConfig";
import { updateUserDTO, UserDTO } from "../dtos/UserDTO";
import BuilderDTO from "../utils/builderDTO";
import { IUser } from "../models/User";

const userService = new UserService();

export default class UserController implements IController {

    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {

            const allowedQueryFields: string[] = ["email", "name", "address.city", "address.state", "address.cep"];
            const filters: Filter = filterConfig(req.query, allowedQueryFields);

            const users = await userService.getAll(filters);
            res.status(200).json(users);
            return;
        } catch (error: any) {
            next(error);
        }
    }
    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id;
            if (!id) {
                throw ThrowError.badRequest("ID não foi informado.");
            }
            const user = await userService.getById(id);
            res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    }
    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const newUserDTO = new BuilderDTO<IUser>(req.body)
                .add("email", "string")
                .add("password", "password")
                .add("name")
                .add("address.street")
                .add("address.number", "number")
                .add("address.complement")
                .add("address.city")
                .add("address.cep")
                .add("address.state")
                .build();

            if (!newUserDTO.email || !newUserDTO.password) {
                throw ThrowError.badRequest("Email e senha obrigatórios.");
            }

            const newUser: UserDTO = await userService.create(req.body);

            res.status(201).json(newUser);
        } catch (error: any) {
            next(error);
        }
    }
    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id;
            if (!id) {
                throw ThrowError.badRequest("ID não foi informado.");
            }

            const updateData: updateUserDTO = new BuilderDTO(req.body)
                .add("name")
                .add("password", "password")
                .add("address.street")
                .add("address.number", "number")
                .add("address.complement")
                .add("address.city")
                .add("address.cep")
                .add("address.state")
                .build();

            const user = await userService.update(id, updateData);
            res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    }
    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id;
            if (!id) {
                throw ThrowError.badRequest("ID não foi informado.");
            }
            await userService.delete(id);
            res.status(204).json();
        } catch (error) {
            next(error);
        }
    }

}