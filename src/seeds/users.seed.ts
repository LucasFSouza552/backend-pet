import { User } from "../models/User";

export const seedUsers = async () => {
    await User.deleteMany({});
    await User.create([
        {
            name: "Lucas Felipe",
            email: "lucas@example.com",
            password: "123456",
            address: {
                street: "Rua das Flores",
                number: "100",
                complement: "Apto 101",
                city: "Muriaé",
                cep: "36800-000",
                state: "MG"
            }
        },
        {
            name: "Ana Maria",
            email: "ana@example.com",
            password: "abcdef",
            address: {
                street: "Avenida Brasil",
                number: "250",
                city: "Juiz de Fora",
                cep: "36000-000",
                state: "MG"
            }
        },
        {
            name: "Carlos Eduardo",
            email: "carlos@example.com",
            password: "qwerty",
            address: {
                street: "Praça Central",
                number: "10",
                complement: "Sala 2",
                city: "Belo Horizonte",
                cep: "30000-000",
                state: "MG"
            }
        }
    ]);
    console.log("✅ Users seed executed");
};