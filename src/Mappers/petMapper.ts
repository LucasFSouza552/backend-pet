import { IPet } from "../models/Pet";
import { PetDTO } from "../dtos/PetDTO";
import { mapToDTO } from "../utils/Mapper";

const petDTOFields: (keyof PetDTO)[] = [
    "id",
    "name",
    "type",
    "age",
    "gender",
    "weight",
    "images",
    "description",
    "adopted",
    "account_id",
    "adoptedAt",
    "createdAt",
    "updatedAt",
];

const petMapper = (pet: IPet) => mapToDTO<IPet, PetDTO>(pet, petDTOFields);

export default petMapper;
