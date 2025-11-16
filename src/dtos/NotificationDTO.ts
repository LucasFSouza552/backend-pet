import INotification from "@models/Notification";

export type CreateNotificationDTO = Omit<INotification, "createdAt" | "viewedAt">;