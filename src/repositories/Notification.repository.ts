import { CreateNotificationDTO } from "@dtos/NotificationDTO";
import { Notification } from "@models/Notification";

export default class NotificationRepository {
    async create(data: CreateNotificationDTO) {
        return await Notification.create(data);
    }
    async getAll() {
        return await Notification.find();
    }
}