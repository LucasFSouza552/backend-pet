import Filter from "./Filter";

export default interface IRepository<CreateType, UpdateType, EntityType> {
    getAll(filter?: Filter): Promise<EntityType[]>;
    getById(id: string): Promise<EntityType | null>;
    create(data: CreateType): Promise<EntityType>;
    update(id: string, data: UpdateType): Promise<EntityType | null>;
    delete(id: string): Promise<void>;
}
