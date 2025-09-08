import { FilterQuery } from "mongoose";
import Filter from "./filter";

export default interface IRepository<T> {
    getAll(filter?: Filter): Promise<T[]>;
    getById(id: string): Promise<T>;
    create(data: T): Promise<T>;
    update(id: string, data: T): Promise<T>;
    delete(id: string): Promise<void>;
}