import { AccountDTO } from "@dtos/AccountDTO";
import { IAccount } from "@models/Account";
import { mapToDTO } from "@utils/Mapper";

const accountDTOFields: (keyof AccountDTO)[] = [
    "id",
    "name",
    "email",
    "avatar",
    "cnpj",
    "role",
    "cpf",
    "address",
    "verified",
    "phone_number",
    "createdAt",
    "updatedAt",
    "postCount"
];

const accountMapper = (account: IAccount) => mapToDTO<IAccount, AccountDTO>(account, accountDTOFields);

export default accountMapper;