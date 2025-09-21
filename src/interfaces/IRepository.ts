import Filter from "./Filter";

export default interface IRepository<CreateType, UpdateType, EntityType> {
    getAll(filter?: Filter): Promise<EntityType[]>;
    getById(id: string): Promise<EntityType>;
    create(data: CreateType): Promise<EntityType>;
    update(id: string, data: UpdateType): Promise<EntityType>;
    delete(id: string): Promise<void>;
}
