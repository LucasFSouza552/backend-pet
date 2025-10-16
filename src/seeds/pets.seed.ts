import { Account } from "@models/Account";
import { Pet } from "@models/Pet";

export const seedPets = async () => {
    await Pet.deleteMany({});

    const institution = await Account.findOne({ role: "institution" });

    await Pet.create(
        [
            {
                name: "Rex",
                type: "Cachorro",
                age: 3,
                gender: "M",
                weight: 22.5,
                images: [],
                description: "Brincalhão, adora correr e se dá bem com crianças.",
                adopted: true,
                account: institution?.id,
            },
            {
                name: "Luna",
                type: "Cachorro",
                age: 2,
                gender: "F",
                weight: 18.2,
                images: [],
                description: "Muito carinhosa e calma, ideal para apartamento.",
                adopted: false,
                account: institution?.id,
            },
            {
                name: "Thor",
                type: "Cachorro",
                age: 5,
                gender: "M",
                weight: 30.0,
                images: [],
                description: "Cão protetor e fiel, ótimo para guarda e companhia.",
                adopted: false,
                account: institution?.id
            },
            {
                name: "Maya",
                type: "Cachorro",
                age: 1,
                gender: "F",
                weight: 10.5,
                images: [],
                description: "Filhote curiosa, cheia de energia e amor.",
                adopted: false,
                account: institution?.id
            },
            {
                name: "Bob",
                type: "Cachorro",
                age: 4,
                gender: "M",
                weight: 25.3,
                images: [],
                description: "Cachorro dócil que adora carinho e passeios longos.",
                adopted: false,
                account: institution?.id
            },
        ]
    );

    console.log("✅ Pets seed executed");
}

