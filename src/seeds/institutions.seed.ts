import { Institution } from "../models/Institution";

export const seedInstitutions = async () => {
    await Institution.deleteMany({});
    await Institution.create([
        {
            name: "Happy Paws Shelter",
            cnpj: "12.345.678/0001-90",
            email: "contact@happypaws.org",
            phone: "+55 31 99999-1111",
            address: {
                street: "Avenida Central",
                number: "456",
                city: "Belo Horizonte",
                cep: "30100-000",
                state: "MG"
            }
        },
        {
            name: "Green Valley Rescue",
            cnpj: "98.765.432/0001-10",
            email: "hello@greenvalley.org",
            phone: "+55 21 98888-2222",
            address: {
                street: "Rua das Palmeiras",
                number: "123",
                city: "Rio de Janeiro",
                cep: "20220-000",
                state: "RJ"
            }
        },
        {
            name: "Sunrise Animal Care",
            cnpj: "55.444.333/0001-77",
            email: "info@sunriseac.org",
            phone: "+55 11 97777-3333",
            address: {
                street: "Alameda das Flores",
                number: "789",
                city: "São Paulo",
                cep: "01010-000",
                state: "SP"
            }
        }
    ]);
    console.log("✅ Institutions seed executed");
}; 