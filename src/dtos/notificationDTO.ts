import INotification from "@models/notification";

export type CreateNotificationDTO = Omit<INotification, "createdAt" | "viewedAt" | "read"> & {
    read?: boolean;
};