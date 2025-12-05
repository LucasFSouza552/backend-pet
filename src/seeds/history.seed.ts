import { Account } from "@models/account";
import { Pet } from "@models/pet";
import { History } from "@models/history";

export const seedHistories = async () => {
    await History.deleteMany({});

    const users = await Account.find({ role: "user" }).limit(5);
    const institutions = await Account.find({ role: "institution" }).limit(2);
    const pets = await Pet.find().limit(5);

    if (users.length === 0) {
        console.log("Histories seed skipped: Need users first");
        return;
    }

    const histories = [];

    // Históricos de adoção
    if (pets.length > 0 && users.length > 0 && institutions.length > 0) {
        const adoptedPet = pets.find(p => p.adopted);
        const firstUser = users[0];
        const firstInstitution = institutions[0];
        if (adoptedPet && firstUser) {
            histories.push({
                type: "adoption" as const,
                status: "completed" as const,
                pet: adoptedPet._id,
                institution: firstInstitution?._id,
                account: firstUser._id,
                amount: null,
                externalReference: null,
            });
        }

        // Adoção pendente
        if (pets.length > 1 && users.length > 1 && pets[1] && users[1]) {
            histories.push({
                type: "adoption" as const,
                status: "pending" as const,
                pet: pets[1]._id,
                institution: institutions[0]?._id,
                account: users[1]._id,
                amount: null,
                externalReference: null,
            });
        }
    }

    // Históricos de apadrinhamento (sponsorship)
    if (pets.length > 0 && users.length > 0 && institutions.length > 0) {
        const firstPet = pets[0];
        const firstUser = users[0];
        const firstInstitution = institutions[0];
        if (firstPet && firstUser) {
            histories.push({
                type: "sponsorship" as const,
                status: "completed" as const,
                pet: firstPet._id,
                institution: firstInstitution?._id,
                account: firstUser._id,
                amount: "50.00",
                externalReference: `sponsor-${firstPet._id}-${Date.now()}`,
            });
        }

        if (pets.length > 1 && users.length > 1 && pets[1] && users[1]) {
            histories.push({
                type: "sponsorship" as const,
                status: "pending" as const,
                pet: pets[1]._id,
                institution: institutions[0]?._id,
                account: users[1]._id,
                amount: "100.00",
                externalReference: `sponsor-${pets[1]._id}-${Date.now()}`,
            });
        }
    }

    // Históricos de doação (donation)
    if (users.length > 0) {
        const firstUser = users[0];
        if (firstUser) {
            histories.push({
                type: "donation" as const,
                status: "completed" as const,
                pet: null,
                institution: null,
                account: firstUser._id,
                amount: "200.00",
                externalReference: `donation-${firstUser._id}-${Date.now()}`,
            });
        }

        if (users.length > 1 && users[1]) {
            histories.push({
                type: "donation" as const,
                status: "pending" as const,
                pet: null,
                institution: null,
                account: users[1]._id,
                amount: "150.00",
                externalReference: `donation-${users[1]._id}-${Date.now()}`,
            });
        }

        if (users.length > 2 && users[2]) {
            histories.push({
                type: "donation" as const,
                status: "cancelled" as const,
                pet: null,
                institution: null,
                account: users[2]._id,
                amount: "75.00",
                externalReference: `donation-${users[2]._id}-${Date.now()}`,
            });
        }
    }

    await History.create(histories);

    console.log("Histories seed executed");
};

