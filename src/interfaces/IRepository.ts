import Filter from "./Filter";

export default interface IRepository<CreateType, UpdateType, EntityType> {
    getAll(filter?: Filter): Promise<EntityType[]>;
    getById(id: string): Promise<EntityType>;
    create(data: CreateType): Promise<CreateType>;
    update(id: string, data: UpdateType): Promise<UpdateType>;
    delete(id: string): Promise<void>;
}
