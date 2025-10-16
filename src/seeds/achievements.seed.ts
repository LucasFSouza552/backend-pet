import { Achievements } from "@models/Achievements";

export const seedAchievements = async () => {
    await Achievements.deleteMany({});

    await Achievements.create([
        {
            name: "Coração Generoso",
            type: "donation",
            description: "Realizou doação e ajudou um pet!"
        },
        {
            name: "Amigo Leal",
            type: "sponsorship",
            description: "Apadrinhar um pet e deu suporte contínuo."
        },
        {
            name: "Lar Feliz",
            type: "adoption",
            description: "Adotou um pet e mudou uma vida para melhor!"
        },
    ]);

    console.log("✅ Achievements seed executed");
}