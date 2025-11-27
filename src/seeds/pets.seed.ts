import { Account } from "@models/account";
import { Pet } from "@models/pet";
export const seedPets = async () => {
    await Pet.deleteMany({});

    const institution = await Account.findOne({ role: "institution" });

    await Pet.create(
        [
            {
                name: "Rex",
                type: "Cachorro",
                age: 3,
                gender: "male",
                weight: 22.5,
                images: [],
                description: "Brincalhão, adora correr e se dá bem com crianças.",
                adopted: false,
                account: institution?.id,
            },
            {
                name: "Luna",
                type: "Cachorro",
                age: 2,
                gender: "female",
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
                gender: "male",
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
                gender: "female",
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
                gender: "male",
                weight: 25.3,
                images: [],
                description: "Cachorro dócil que adora carinho e passeios longos.",
                adopted: false,
                account: institution?.id
            },
            {
                name: "Mel",
                type: "Gato",
                age: 2,
                gender: "female",
                weight: 4.2,
                images: [],
                description: "Gata independente e carinhosa, perfeita para quem busca companhia tranquila.",
                adopted: false,
                account: institution?.id
            },
            {
                name: "Max",
                type: "Cachorro",
                age: 6,
                gender: "male",
                weight: 28.0,
                images: [],
                description: "Cão experiente e calmo, ideal para famílias com crianças.",
                adopted: false,
                account: institution?.id
            },
            {
                name: "Bella",
                type: "Gato",
                age: 1,
                gender: "female",
                weight: 3.5,
                images: [],
                description: "Gatinha brincalhona e curiosa, adora explorar e brincar.",
                adopted: false,
                account: institution?.id
            },
        ]
    );

    console.log("✅ Pets seed executed");
}

