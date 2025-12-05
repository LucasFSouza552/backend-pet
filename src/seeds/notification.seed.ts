import { Account } from "@models/account";
import { Notification } from "@models/notification";
import { Types } from "mongoose";

export const seedNotifications = async () => {
    await Notification.deleteMany({});

    const users = await Account.find({ role: "user" }).limit(3);
    const institutions = await Account.find({ role: "institution" }).limit(2);

    if (users.length === 0 || institutions.length === 0) {
        console.log("Notifications seed skipped: Need users and institutions first");
        return;
    }

    const mockImageId = new Types.ObjectId();

    const notifications = [
        {
            sender: institutions[0]?._id,
            type: "info" as const,
            content: "Novo pet disponível para adoção! Venha conhecer nossos peludos.",
            image: mockImageId,
            latitude: -23.5505,
            longitude: -46.6333,
            viewedAt: null,
        },
        {
            sender: institutions[0]?._id,
            type: "like" as const,
            content: "Alguém demonstrou interesse em adotar um de nossos pets!",
            image: mockImageId,
            latitude: -23.5505,
            longitude: -46.6333,
            viewedAt: new Date(),
        },
        {
            sender: institutions[1]?._id,
            type: "warning" as const,
            content: "Lembrete: Vacinação anual dos pets está chegando.",
            image: mockImageId,
            latitude: -22.9068,
            longitude: -43.1729,
            viewedAt: null,
        },
        {
            sender: institutions[0]?._id,
            type: "info" as const,
            content: "Evento de adoção neste final de semana! Não perca!",
            image: mockImageId,
            latitude: -23.5505,
            longitude: -46.6333,
            viewedAt: new Date(),
        },
        {
            sender: institutions[1]?._id,
            type: "like" as const,
            content: "Sua solicitação de adoção foi aprovada! Entre em contato conosco.",
            image: mockImageId,
            latitude: -22.9068,
            longitude: -43.1729,
            viewedAt: null,
        },
    ];

    await Notification.create(notifications);

    console.log("Notifications seed executed");
};

