import { CreateNotificationDTO } from "@dtos/notificationDTO";
import { Notification } from "@models/notification";

export default class NotificationRepository {
    async create(data: CreateNotificationDTO) {
        return await Notification.create(data);
    }
    async getAll() {
        return await Notification.find();
    }
}