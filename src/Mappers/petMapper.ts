import { PetDTO } from "@dtos/PetDTO";
import IPet from "@models/Pet";
import { mapToDTO } from "@utils/Mapper";

const petDTOFields: (keyof PetDTO)[] = [
    "name",
    "type",
    "age",
    "gender",
    "weight",
    "images",
    "description",
    "adopted",
    "account",
    "adoptedAt",
    "createdAt"
];

const petMapper = (pet: IPet) => mapToDTO<IPet, PetDTO>(pet, petDTOFields);

export default petMapper;
