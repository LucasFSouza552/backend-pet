import { CreateNotificationDTO } from "@dtos/notificationDTO";
import { ThrowError } from "@errors/ThrowError";
import { notificationRepository } from "@repositories/index";
import { PictureStorageRepository } from "@repositories/pictureStorage.repository";

export default class NotificationService {
    async getAll() {
        try {
            return await notificationRepository.getAll();
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Erro ao retornar as notificações.");
        }
    }

    async create(data: CreateNotificationDTO, image: Express.Multer.File) {
        try {
            const imageId = await PictureStorageRepository.uploadImage(image);
            if(!imageId) {
                throw ThrowError.badRequest("Erro ao enviar a alerta.");
            }
            data.image = imageId;
            return await notificationRepository.create(data);
        } catch (error) {
            if (error instanceof ThrowError) throw error;
            throw ThrowError.internal("Erro ao criar uma notificação.");
        }
    }
}