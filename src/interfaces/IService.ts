import Filter from "./Filter";

export default interface IService<CreateType, UpdateType, EntityType> {
    getAll(filter?: Filter): Promise<EntityType[]>;
    getById(id: string): Promise<EntityType>;
    create(data: CreateType): Promise<CreateType>;
    update(id: string, data: CreateType): Promise<UpdateType>;
    delete(id: string): Promise<void>;
}
