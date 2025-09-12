import Filter from "./Filter";

export default interface IService<T> {
    getAll(filter?: Filter): Promise<T[]>;
    getById(id: string): Promise<T>;
    create(data: T): Promise<T>;
    update(id: string, data: T): Promise<T>;
    delete(id: string): Promise<void>;
}